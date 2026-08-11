import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

import { CompilerRuntimeError } from './errors.mjs';

export const HEADER_PROFILE_ALGORITHM = 'sha256-path-u32le-size-u64le-content-v1';

const MAX_PROFILE_FILES = 4_096;
const MAX_PROFILE_BYTES = 64 * 1024 * 1024;

function profileError(code, message, details) {
  return new CompilerRuntimeError(code, 'unsupported', message, details);
}

function validateRoots(roots) {
  if (!Array.isArray(roots) || roots.length < 1
      || roots.some((root) => typeof root !== 'string' || !/^[a-z0-9_-]+$/.test(root))
      || new Set(roots).size !== roots.length) {
    throw profileError('COMPILER_HEADER_PROFILE_MANIFEST', 'Compiler header-profile roots are invalid.');
  }
  return roots;
}

function validateRecord(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)
      || record.algorithm !== HEADER_PROFILE_ALGORITHM
      || typeof record.profile !== 'string' || record.profile.length < 1
      || !Number.isSafeInteger(record.fileCount) || record.fileCount < 1 || record.fileCount > MAX_PROFILE_FILES
      || !Number.isSafeInteger(record.byteLength) || record.byteLength < 1 || record.byteLength > MAX_PROFILE_BYTES
      || typeof record.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.sha256)) {
    throw profileError('COMPILER_HEADER_PROFILE_MANIFEST', 'Compiler header-profile manifest is invalid.');
  }
  validateRoots(record.roots);
  return record;
}

function isContained(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function sameEntry(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode
    && left.size === right.size && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
}

async function inspectPath(candidate, canonicalRoot, expectedKind) {
  let info;
  let resolved;
  try {
    info = await lstat(candidate);
    if (info.isSymbolicLink()) throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains a symbolic link.');
    if ((expectedKind === 'directory' && !info.isDirectory()) || (expectedKind === 'file' && !info.isFile())) {
      throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains an unexpected entry type.');
    }
    resolved = await realpath(candidate);
  } catch (error) {
    if (error instanceof CompilerRuntimeError) throw error;
    throw profileError('COMPILER_HEADER_PROFILE_MISSING', 'Compiler header-profile entry is unavailable.');
  }
  if (!isContained(canonicalRoot, resolved)) throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile resolves outside its canonical root.');
  return { info, resolved };
}

async function collectFiles(canonicalRoot, roots) {
  const names = [];
  async function walk(relative) {
    const directory = path.join(canonicalRoot, ...relative.split('/'));
    const before = await inspectPath(directory, canonicalRoot, 'directory');
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      throw profileError('COMPILER_HEADER_PROFILE_MISSING', 'Compiler header-profile root is unavailable.');
    }
    const after = await inspectPath(directory, canonicalRoot, 'directory');
    if (!sameEntry(before.info, after.info) || before.resolved !== after.resolved) {
      throw profileError('COMPILER_HEADER_PROFILE_IDENTITY', 'Compiler header profile changed while it was being inventoried.');
    }
    entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
    for (const entry of entries) {
      const child = `${relative}/${entry.name}`;
      const candidate = path.join(canonicalRoot, ...child.split('/'));
      const current = await lstat(candidate).catch(() => { throw profileError('COMPILER_HEADER_PROFILE_MISSING', 'Compiler header-profile entry is unavailable.'); });
      if (entry.isSymbolicLink() || current.isSymbolicLink()) throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains a symbolic link.');
      if (entry.isDirectory() && current.isDirectory()) await walk(child);
      else if (entry.isFile() && current.isFile()) names.push(child);
      else throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains a changed or non-regular entry.');
      if (names.length > MAX_PROFILE_FILES) throw profileError('COMPILER_HEADER_PROFILE_LIMIT', 'Compiler header profile exceeds its file-count limit.');
    }
  }
  for (const root of roots) await walk(root);
  names.sort();
  return names;
}

async function canonicalProfileRoot(root) {
  let rootInfo;
  let canonicalRoot;
  try {
    rootInfo = await lstat(root);
    if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header-profile root must be a real directory.');
    canonicalRoot = await realpath(root);
  } catch (error) {
    if (error instanceof CompilerRuntimeError) throw error;
    throw profileError('COMPILER_HEADER_PROFILE_MISSING', 'Compiler header-profile root is unavailable.');
  }
  return canonicalRoot;
}

export async function inventoryHeaderProfile(root, requestedRoots) {
  const roots = validateRoots(requestedRoots);
  const canonicalRoot = await canonicalProfileRoot(root);
  const names = await collectFiles(canonicalRoot, roots);
  const hash = createHash('sha256');
  const headers = [];
  let byteLength = 0;
  for (const name of names) {
    const nameBytes = Buffer.from(name, 'utf8');
    const file = path.join(canonicalRoot, ...name.split('/'));
    let handle;
    let bytes;
    try {
      const before = await inspectPath(file, canonicalRoot, 'file');
      if (byteLength + before.info.size > MAX_PROFILE_BYTES) throw profileError('COMPILER_HEADER_PROFILE_LIMIT', 'Compiler header profile exceeds its byte limit.');
      handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
      const opened = await handle.stat();
      if (!opened.isFile() || !sameEntry(before.info, opened)) throw profileError('COMPILER_HEADER_PROFILE_IDENTITY', 'Compiler header profile changed before it was opened.');
      bytes = await handle.readFile();
      const after = await inspectPath(file, canonicalRoot, 'file');
      if (!sameEntry(opened, after.info) || before.resolved !== after.resolved || bytes.byteLength !== opened.size || opened.size !== after.info.size) {
        throw profileError('COMPILER_HEADER_PROFILE_IDENTITY', 'Compiler header profile changed while it was being snapshotted.');
      }
    } catch (error) {
      if (error instanceof CompilerRuntimeError) throw error;
      if (error?.code === 'ELOOP') throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains a symbolic link.');
      throw profileError('COMPILER_HEADER_PROFILE_MISSING', 'Compiler header-profile file is unavailable.');
    } finally {
      await handle?.close();
    }
    if (bytes.includes(0)) throw profileError('COMPILER_HEADER_PROFILE_UNSAFE', 'Compiler header profile contains NUL data.');
    byteLength += bytes.byteLength;
    if (byteLength > MAX_PROFILE_BYTES) throw profileError('COMPILER_HEADER_PROFILE_LIMIT', 'Compiler header profile exceeds its byte limit.');
    const nameLength = Buffer.alloc(4);
    nameLength.writeUInt32LE(nameBytes.byteLength);
    const contentLength = Buffer.alloc(8);
    contentLength.writeBigUInt64LE(BigInt(bytes.byteLength));
    hash.update(nameLength);
    hash.update(nameBytes);
    hash.update(contentLength);
    hash.update(bytes);
    const source = Buffer.alloc(bytes.byteLength + 1);
    bytes.copy(source);
    headers.push({ name, source });
  }
  const observed = Object.freeze({ algorithm: HEADER_PROFILE_ALGORITHM, roots: Object.freeze([...roots]), fileCount: headers.length, byteLength, sha256: hash.digest('hex') });
  return { observed, headers };
}

export async function snapshotHeaderProfile(root, manifestRecord) {
  const record = validateRecord(manifestRecord);
  const { observed, headers } = await inventoryHeaderProfile(root, record.roots);
  if (observed.fileCount !== record.fileCount || observed.byteLength !== record.byteLength || observed.sha256 !== record.sha256) {
    throw profileError('COMPILER_HEADER_PROFILE_IDENTITY', 'Compiler header profile differs from the accepted manifest.', observed);
  }
  return { identity: Object.freeze({ ...record, roots: Object.freeze([...record.roots]) }), headers };
}
