import { readFile } from 'node:fs/promises';

const integer64Types = new Set(['i64', 'u64', 'size', 'intptr', 'uintptr', 'handle']);
const supportedFfiTypes = new Set([
  'void', 'i8', 'u8', 'i16', 'u16', 'i32', 'u32', 'i64', 'u64', 'f32', 'f64', 'pointer',
]);

export async function loadRuntimeIr(path) {
  return validateRuntimeIr(JSON.parse(await readFile(path, 'utf8')));
}

export function validateRuntimeIr(ir) {
  if (ir.schemaVersion !== 1) throw new Error(`Unsupported Runtime IR version: ${ir.schemaVersion}`);
  if (ir.abi.pointerBits !== 64 || ir.abi.sizeBits !== 64) {
    throw new Error('EXP-000 currently fails closed outside a 64-bit pointer/size profile.');
  }
  if (ir.abi.byteOrder !== 'little-endian') {
    throw new Error('EXP-000 currently fails closed outside little-endian profiles.');
  }

  const ids = new Set();
  for (const entry of ir.cases) {
    if (ids.has(entry.id)) throw new Error(`Duplicate Runtime IR case id: ${entry.id}`);
    ids.add(entry.id);
    if (!(entry.symbol in ir.functions)) throw new Error(`Case ${entry.id} references unknown symbol ${entry.symbol}`);
  }
  for (const [symbol, signature] of Object.entries(ir.functions)) {
    for (const type of [...signature.arguments, signature.return]) {
      if (!supportedFfiTypes.has(type)) throw new Error(`Function ${symbol} uses unsupported FFI type ${type}`);
    }
  }
  return ir;
}

export function caseById(ir, id) {
  const entry = ir.cases.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown case id: ${id}`);
  return entry;
}

export function toFfiValue(type, value) {
  if (integer64Types.has(type)) return BigInt(value);
  return value;
}

export function toPublicValue(value) {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(toPublicValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toPublicValue(child)]));
  }
  return value;
}

function argumentClasses(signature) {
  let integer = 0;
  let floating = 0;
  let buffers = 0;
  for (const type of signature.arguments) {
    if (type === 'f32' || type === 'f64') floating++;
    else integer++;
    if (type === 'buffer' || type === 'arraybuffer') buffers++;
  }
  return { integer, floating, buffers };
}

export function classifyFastEligibility(signature, profile = { platform: process.platform, architecture: process.arch }) {
  const count = signature.arguments.length;
  const classes = argumentClasses(signature);
  const base = {
    classification: 'generic-fallback',
    directQualification: false,
    sourceTag: 'v26.7.0',
    sourceCommit: 'b4f23d3619c98bed09af93a21192f6080197a8c6',
    profile,
    arguments: count,
    ...classes,
  };

  if (count > 8) return { ...base, reason: 'node-fast-global-eight-argument-cap' };
  if (!['x64', 'arm64'].includes(profile.architecture)) {
    return { ...base, reason: 'profile-has-no-exp-000-fast-model' };
  }

  if (profile.platform === 'win32' && profile.architecture === 'x64') {
    if (classes.buffers > 0) return { ...base, reason: 'win64-emitter-rejects-fast-buffer-arguments' };
    if (count > 3) return { ...base, reason: 'win64-receiver-leaves-three-public-register-positions' };
    return { ...base, classification: 'fast-jit-candidate', reason: 'win64-source-envelope-only' };
  }

  if (profile.architecture === 'x64') {
    if (classes.floating > 8 || classes.integer > 6) {
      return { ...base, reason: 'sysv-x64-register-envelope-exceeded' };
    }
    if (classes.buffers > 0 && classes.floating > 0) {
      return { ...base, reason: 'sysv-x64-buffer-helper-does-not-preserve-fp-arguments' };
    }
    if (classes.buffers > 0 && classes.integer + 1 > 5) {
      return { ...base, reason: 'sysv-x64-buffer-helper-register-envelope-exceeded' };
    }
    return { ...base, classification: 'fast-jit-candidate', reason: 'sysv-x64-source-envelope-only' };
  }

  if (profile.architecture === 'arm64') {
    if (classes.floating > 8 || classes.integer > 7) {
      return { ...base, reason: 'aapcs64-register-envelope-exceeded' };
    }
    return { ...base, classification: 'fast-jit-candidate', reason: 'aapcs64-source-envelope-only' };
  }

  return { ...base, reason: 'profile-has-no-exp-000-fast-model' };
}

export function definitionsFromIr(ir) {
  return Object.fromEntries(Object.entries(ir.functions).map(([symbol, signature]) => [symbol, {
    arguments: signature.arguments,
    return: signature.return,
  }]));
}
