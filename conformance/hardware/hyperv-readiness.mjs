import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { repositoryRoot } from './qualification.mjs';

const microsoftSources = [
  'https://learn.microsoft.com/en-us/troubleshoot/windows-server/virtualization/troubleshoot-hyper-v-gpu-assignment-partitioning-passthrough-issues',
  'https://learn.microsoft.com/en-us/powershell/module/hyper-v/get-vmhostpartitionablegpu?view=windowsserver2025-ps',
];

export function classifyHyperVReadiness(observed) {
  const reasons = [];
  if (observed.platform !== 'win32') reasons.push('windows-host-required');
  if (!observed.hyperVModulePresent) reasons.push('hyper-v-module-unavailable');
  if (/Windows (?:10|11) (?:Pro|Home|Enterprise)/i.test(observed.osCaption ?? '')) reasons.push('client-host-vendor-unsupported');
  if (observed.partitionableGpuCount === 0) reasons.push('no-partitionable-gpu');
  if (observed.assignedGpuPartitionAdapterCount === 0) reasons.push('no-assigned-gpu-partition');
  return {
    readinessStatus: reasons.length === 0 ? 'ready-for-qualification' : 'blocked',
    qualificationStatus: reasons.includes('client-host-vendor-unsupported') ? 'known-incompatible' : 'not-qualified',
    reasons,
  };
}

function probePowerShell() {
  const source = [
    "$hyperv = Get-Module -ListAvailable -Name Hyper-V",
    "$vms = if ($hyperv) { @(Get-VM -ErrorAction SilentlyContinue) } else { @() }",
    "$partitionable = if ($hyperv) { @(Get-VMHostPartitionableGpu -ErrorAction SilentlyContinue) } else { @() }",
    "$assigned = if ($hyperv) { @($vms | ForEach-Object { @(Get-VMGpuPartitionAdapter -VM $_ -ErrorAction SilentlyContinue) }).Count } else { 0 }",
    "$os = Get-CimInstance -ClassName Win32_OperatingSystem",
    "[pscustomobject]@{ hyperVModulePresent = [bool]$hyperv; osCaption = $os.Caption; osVersion = $os.Version; vmCount = $vms.Count; runningVmCount = @($vms | Where-Object State -eq 'Running').Count; partitionableGpuCount = $partitionable.Count; assignedGpuPartitionAdapterCount = $assigned } | ConvertTo-Json -Compress",
  ].join('; ');
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', source], { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('The read-only Hyper-V inventory probe failed.');
  return JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1));
}

function visibleCudaGpuCount() {
  const result = spawnSync('nvidia-smi.exe', ['-L'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error || result.status !== 0) return { toolAvailable: false, count: null };
  return { toolAvailable: true, count: result.stdout.split(/\r?\n/).filter((line) => line.trim()).length };
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(`Git identity probe failed: ${args.join(' ')}`);
  return result.stdout.trim();
}

export async function runHyperVReadiness() {
  if (process.platform !== 'win32') throw new Error('The Hyper-V readiness probe requires a Windows host.');
  const observed = { platform: process.platform, architecture: process.arch, ...probePowerShell(), hostCuda: visibleCudaGpuCount() };
  const classification = classifyHyperVReadiness(observed);
  const record = {
    schemaVersion: 1,
    probe: 'hyper-v-gpu-readiness',
    testedAt: new Date().toISOString(),
    source: {
      commit: git(['rev-parse', 'HEAD']),
      tree: git(['rev-parse', 'HEAD^{tree}']),
      cleanTree: git(['status', '--porcelain=v1']).length === 0,
    },
    observed,
    ...classification,
    mutationPerformed: false,
    upstreamSources: microsoftSources,
    privacy: {
      omitted: ['VM names', 'host name', 'account', 'paths', 'GPU UUID', 'serial number', 'bus identifier'],
    },
    claimLimits: [
      'This is a read-only readiness and verified-negative record for the exact observed host.',
      'A qualification-required result still does not establish virtualized CUDA-JS support.',
    ],
  };
  const runId = record.testedAt.replace(/[-:.]/g, '').replace('Z', 'Z');
  const output = path.join(repositoryRoot, 'build', 'hardware-qualification', 'hyperv-readiness', runId, 'readiness.json');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(record, null, 2)}\n`);
  console.log(JSON.stringify({ output: path.relative(repositoryRoot, output), readinessStatus: record.readinessStatus, qualificationStatus: record.qualificationStatus, reasons: record.reasons }));
  return record;
}
