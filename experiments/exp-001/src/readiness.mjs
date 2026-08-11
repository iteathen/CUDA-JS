import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { sha256 } from '../../exp-012/src/evidence.mjs';
import { evidenceRoot, profilePath } from './paths.mjs';

const profile = JSON.parse(await readFile(profilePath, 'utf8'));
const kernel = os.release();
const isWsl = /microsoft/i.test(kernel) || Boolean(process.env.WSL_INTEROP || process.env.WSL_DISTRO_NAME);
const driverCandidate = profile.driverCandidates.find((candidate) => existsSync(candidate)) ?? null;
const driverPath = driverCandidate ? realpathSync(driverCandidate) : null;
const deviceNodes = Object.fromEntries(profile.requiredDeviceNodes.map((node) => [node, existsSync(node)]));
const nvidiaSmi = spawnSync('nvidia-smi', ['--query-gpu=name,driver_version,compute_cap', '--format=csv,noheader'], { encoding: 'utf8' });
const ready = process.platform === profile.platform
  && process.arch === profile.architecture
  && process.version === profile.nodeVersion
  && !isWsl
  && driverPath !== null
  && Object.values(deviceNodes).every(Boolean)
  && !nvidiaSmi.error
  && nvidiaSmi.status === 0;

const record = {
  schemaVersion: 1,
  experiment: 'EXP-001',
  capsule: 'native-linux-environment-readiness',
  status: ready ? 'ready' : 'environment-incomplete',
  generatedAt: new Date().toISOString(),
  profileId: profile.id,
  observed: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
    kernel,
    glibc: process.report.getReport().header.glibcVersionRuntime,
    isWsl,
    driverPath,
    driverSha256: driverPath ? await sha256(driverPath) : null,
    deviceNodes,
    nvidiaSmi: {
      available: !nvidiaSmi.error,
      processStatus: nvidiaSmi.status,
      stdout: nvidiaSmi.stdout?.trim() || '',
      errorCode: nvidiaSmi.error?.code ?? null,
    },
  },
  missing: [
    ...(process.version === profile.nodeVersion ? [] : [`official Node ${profile.nodeVersion}`]),
    ...(isWsl ? ['native Linux environment (WSL is a separate profile)'] : []),
    ...(driverPath ? [] : ['canonical system libcuda.so.1']),
    ...Object.entries(deviceNodes).filter(([, present]) => !present).map(([node]) => node),
    ...(!nvidiaSmi.error && nvidiaSmi.status === 0 ? [] : ['working nvidia-smi GPU/Driver query']),
  ],
  nextActions: ready ? [
    'Run npm run exp:001:smoke.',
    'Review build/exp-001/linux-x64/evidence/smoke.json before claiming CJS-F2L.',
  ] : [
    'Use native Ubuntu 24.04 x86-64 with a supported NVIDIA GPU and current Driver.',
    'Install the NVIDIA Driver so libcuda.so.1, nvidia-smi, /dev/nvidiactl, and /dev/nvidia0 are present.',
    'Re-run npm run exp:001:readiness; do not weaken or bypass the missing checks.',
  ],
};
await mkdir(evidenceRoot, { recursive: true });
await writeFile(path.join(evidenceRoot, 'readiness.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(`EXP-001 readiness: ${record.status}`);
for (const missing of record.missing) console.log(`  missing: ${missing}`);
