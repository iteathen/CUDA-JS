import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { LIMITS } from './contract.mjs';

const MANIFEST_LIMIT = 65_536;

export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  throw new TypeError('Cache identity contains an unsupported value.');
}

export function cacheKey(identity) {
  return createHash('sha256').update(canonicalJson(identity)).digest('hex');
}

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function missing(error) { return error?.code === 'ENOENT'; }

export class ArtifactCache {
  #directory;
  #mode;

  constructor({ directory, mode }) {
    this.#directory = directory;
    this.#mode = mode;
  }

  get mode() { return this.#mode; }

  async initialize() {
    if (this.#mode === 'read-write') await mkdir(this.#directory, { recursive: true });
  }

  paths(key) {
    return { manifest: path.join(this.#directory, `${key}.manifest.json`), artifact: path.join(this.#directory, `${key}.bin`) };
  }

  async lookup(identity) {
    const key = cacheKey(identity);
    if (this.#mode === 'disabled') return { key, status: 'disabled', artifact: null };
    const files = this.paths(key);
    const [manifestRead, artifactRead] = await Promise.allSettled([readFile(files.manifest), readFile(files.artifact)]);
    const manifestMissing = manifestRead.status === 'rejected' && missing(manifestRead.reason);
    const artifactMissing = artifactRead.status === 'rejected' && missing(artifactRead.reason);
    if (manifestMissing && artifactMissing) return { key, status: 'miss', artifact: null, corruption: false };
    try {
      if (manifestRead.status === 'rejected') throw manifestRead.reason;
      if (artifactRead.status === 'rejected') throw artifactRead.reason;
      const manifestBytes = manifestRead.value;
      if (manifestBytes.byteLength > MANIFEST_LIMIT) throw new Error('manifest-limit');
      const manifest = JSON.parse(manifestBytes.toString('utf8'));
      const artifact = artifactRead.value;
      const expected = {
        schemaVersion: 1,
        key,
        identity,
        artifact: { format: identity.request.output, byteLength: artifact.byteLength, sha256: sha256(artifact) },
      };
      if (artifact.byteLength < 1 || artifact.byteLength > LIMITS.artifactBytes || canonicalJson(manifest) !== canonicalJson(expected)) throw new Error('entry-mismatch');
      return { key, status: 'hit', artifact: Uint8Array.from(artifact), manifest };
    } catch (error) {
      await this.#quarantine(key, files);
      return { key, status: 'miss', artifact: null, corruption: true };
    }
  }

  async publish(identity, bytes) {
    const key = cacheKey(identity);
    if (this.#mode !== 'read-write') return { key, status: this.#mode === 'disabled' ? 'disabled' : 'miss' };
    const artifact = Buffer.from(bytes);
    const manifest = {
      schemaVersion: 1,
      key,
      identity,
      artifact: { format: identity.request.output, byteLength: artifact.byteLength, sha256: sha256(artifact) },
    };
    const files = this.paths(key);
    const nonce = randomUUID();
    const temporary = { artifact: `${files.artifact}.${nonce}.tmp`, manifest: `${files.manifest}.${nonce}.tmp` };
    try {
      await writeFile(temporary.artifact, artifact, { flag: 'wx' });
      await writeFile(temporary.manifest, `${canonicalJson(manifest)}\n`, { flag: 'wx' });
      try { await rename(temporary.artifact, files.artifact); } catch (error) { if (error.code !== 'EEXIST') throw error; }
      try { await rename(temporary.manifest, files.manifest); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    } finally {
      await Promise.all([unlink(temporary.artifact).catch(() => {}), unlink(temporary.manifest).catch(() => {})]);
    }
    return { key, status: 'miss', manifest };
  }

  async invalidate(key) {
    if (!/^[a-f0-9]{64}$/.test(key)) throw Object.assign(new Error('Cache key must be lowercase SHA-256.'), { code: 'COMPILER_CACHE_KEY_INVALID', category: 'validation' });
    if (this.#mode === 'read-only') return { schemaVersion: 1, key, status: 'read-only' };
    if (this.#mode === 'disabled') return { schemaVersion: 1, key, status: 'absent' };
    const files = this.paths(key);
    let removed = false;
    for (const file of [files.manifest, files.artifact]) {
      try { await unlink(file); removed = true; } catch (error) { if (!missing(error)) throw error; }
    }
    return { schemaVersion: 1, key, status: removed ? 'invalidated' : 'absent' };
  }

  async #quarantine(key, files) {
    if (this.#mode !== 'read-write') return;
    const nonce = randomUUID();
    for (const [kind, file] of Object.entries(files)) {
      try { await rename(file, path.join(this.#directory, `${key}.${kind}.${nonce}.corrupt`)); } catch (error) { if (!missing(error)) throw error; }
    }
  }
}
