import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const ignoredDirectories = new Set(['.git', 'build', 'node_modules', 'docs/archive']);

const required = [
  'README.md', 'AGENTS.md', 'STATUS.md', 'next_step.yaml', 'CONTRIBUTING.md', 'package.json',
  'agent_files/README.md', 'agent_files/AGENTS.md', 'agent_files/AI_RULES.md',
  'agent_files/DESIGN_ALIGNMENT_CARD.md', 'agent_files/SYSTEM_REGISTRY.md', 'agent_files/VALIDATION_POLICY.md',
  'agent_files/general_foundation/README.md', 'agent_files/general_foundation/PRINCIPLES.md',
  'agent_files/general_foundation/ENGINEERING_JUDGMENT.md', 'agent_files/general_foundation/ASSESSMENT_AND_PLANNING.md',
  'agent_files/general_foundation/PROJECT_ORGANIZATION.md', 'agent_files/general_foundation/SPEC_AND_AGENT_FILE_READING.md',
  'agent_files/general_foundation/FOCUS_BRANCHES.md', 'agent_files/general_foundation/PLAN_EXECUTION.md',
  'agent_files/general_foundation/TESTING.md', 'agent_files/general_foundation/DEBUGGING.md',
  'agent_files/general_foundation/SANITY_CHECKING.md', 'agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md',
  'agent_files/general_foundation/CLEANUP_AND_DISPOSITION.md', 'agent_files/general_foundation/TOKEN_DISCIPLINE.md',
  'agent_files/general_foundation/DOCUMENTATION_GOVERNANCE.md', 'agent_files/general_foundation/SECURITY.md',
  'agent_files/application_specific/CUDA_JS_PROFILE.md',
  'docs/README.md', 'docs/FOUNDATION_INDEX.md', 'docs/PROJECT_CHARTER.md', 'docs/INTEROP_WITH_UMCGS.md',
  'docs/decisions/README.md', 'docs/decisions/ADR-0001-repository-boundary.md',
  'docs/decisions/ADR-0002-node-ffi-first-host-binding.md',
  'docs/decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md',
  'docs/architecture/README.md', 'docs/architecture/FRAMEWORK_OVERVIEW.md',
  'docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md', 'docs/architecture/TARGET_ARCHITECTURE.md',
  'docs/architecture/V0_SUPPORT_MATRIX.md', 'docs/plans/README.md',
  'docs/plans/2026-08-10-master-plan.md', 'docs/plans/2026-08-10-focus-branch-map.json',
  'docs/specs/README.md', 'docs/specs/SPEC-0000-runtime-contract-map.md',
  'docs/specs/SPEC-0001-cuda-schema-compiler.md',
  'docs/specs/SPEC-0002-windows-driver-bootstrap.md',
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md',
  'docs/specs/SPEC-0004-device-memory-foundation.md',
  'docs/specs/SPEC-0005-module-launch-completion.md',
  'docs/specs/SPEC-0006-compiler-linker-cache.md',
  'docs/research/README.md', 'docs/research/2026-08-10-technical-assumption-audit.md',
  'docs/research/2026-08-10-node-ffi-cuda-landscape.md', 'docs/research/source-register.yaml',
  'docs/archive/README.md', 'experiments/README.md', 'experiments/EXPERIMENT_MATRIX.md',
  'experiments/EXP-000-node-ffi-synthetic-abi.md', 'experiments/EXP-001-node-ffi-cuda-smoke.md',
  'experiments/EXP-012-windows-node-ffi-cuda-smoke.md',
  'experiments/exp-000/README.md', 'experiments/exp-000/case-schema.json',
  'experiments/exp-000/generated/runtime-ir.json', 'experiments/exp-000/generated/synthetic_abi.h',
  'experiments/exp-000/generated/synthetic_abi.c', 'experiments/exp-000/generated/oracle.c',
  'experiments/exp-001/README.md', 'experiments/exp-001/profile.json',
  'experiments/exp-001/generated/oracle.c', 'experiments/exp-001/src/paths.mjs',
  'experiments/exp-001/src/build.mjs', 'experiments/exp-001/src/readiness.mjs',
  'experiments/exp-001/src/permission-probe.mjs', 'experiments/exp-001/src/run-smoke.mjs',
  'experiments/exp-012/README.md', 'experiments/exp-012/generated/oracle.c',
  'experiments/exp-012/src/paths.mjs', 'experiments/exp-012/src/evidence.mjs',
  'experiments/exp-012/src/build.mjs', 'experiments/exp-012/src/driver-worker.mjs',
  'experiments/exp-012/src/permission-probe.mjs', 'experiments/exp-012/src/run-smoke.mjs',
  'experiments/exp-012/src/verify.mjs',
  'experiments/exp-009/README.md', 'experiments/exp-009/fixtures/vector-add.cu.txt',
  'experiments/exp-009/native/windows-compiler-oracle.c',
  'experiments/exp-009/src/run-native-windows.mjs',
  'benchmarks/README.md', 'components/README.md',
  'components/resource-registry/README.md', 'components/resource-registry/component.yaml',
  'components/resource-registry/index.mjs', 'components/resource-registry/src/resource-error.mjs',
  'components/resource-registry/src/resource-registry.mjs',
  'components/resource-registry/test/resource-registry.test.mjs',
  'components/driver-actor/README.md', 'components/driver-actor/component.yaml',
  'components/driver-actor/index.mjs', 'components/driver-actor/testing.mjs',
  'components/driver-actor/src/errors.mjs', 'components/driver-actor/src/health.mjs',
  'components/driver-actor/src/protocol.mjs', 'components/driver-actor/src/driver-runtime.mjs',
  'components/driver-actor/src/actor-worker.mjs',
  'components/driver-actor/src/backends/mock.mjs',
  'components/driver-actor/src/backends/windows-native.mjs',
  'components/driver-actor/test/driver-runtime.test.mjs',
  'components/driver-actor/test/health.test.mjs',
  'components/memory/README.md', 'components/memory/component.yaml',
  'components/memory/index.mjs', 'components/memory/src/memory-manager.mjs',
  'components/memory/test/memory-manager.test.mjs',
  'components/execution/README.md', 'components/execution/component.yaml',
  'components/execution/index.mjs', 'components/execution/src/execution-manager.mjs',
  'components/execution/test/execution-manager.test.mjs',
  'components/compiler-actor/README.md', 'components/compiler-actor/component.yaml',
  'components/compiler-actor/index.mjs', 'components/compiler-actor/testing.mjs',
  'components/compiler-actor/src/errors.mjs', 'components/compiler-actor/src/contract.mjs',
  'components/compiler-actor/src/cache.mjs', 'components/compiler-actor/src/compiler-runtime.mjs',
  'components/compiler-actor/src/actor-worker.mjs',
  'components/compiler-actor/src/backends/mock.mjs',
  'components/compiler-actor/src/backends/windows-native.mjs',
  'components/compiler-actor/test/compiler-actor.test.mjs',
  'schemas/README.md', 'conformance/README.md',
  'conformance/f3/README.md', 'conformance/f3/evidence.mjs',
  'conformance/f3/run-mock.mjs', 'conformance/f3/run-native-windows.mjs',
  'conformance/f3/verify.mjs',
  'conformance/f4/README.md', 'conformance/f4/evidence.mjs',
  'conformance/f4/run-mock.mjs', 'conformance/f4/build-native-windows.mjs',
  'conformance/f4/run-native-windows.mjs', 'conformance/f4/verify.mjs',
  'conformance/f4/native/windows-memory-oracle.c',
  'conformance/f5/README.md', 'conformance/f5/evidence.mjs',
  'conformance/f5/run-mock.mjs', 'conformance/f5/build-native-windows.mjs',
  'conformance/f5/run-native-windows.mjs', 'conformance/f5/verify.mjs',
  'conformance/f5/native/windows-launch-oracle.c',
  'conformance/f5/fixtures/vector-add.ptx.txt',
  'conformance/f6/README.md', 'conformance/f6/evidence.mjs',
  'conformance/f6/run-portable.mjs', 'conformance/f6/run-native-windows.mjs',
  'conformance/f6/run-linux-readiness.mjs', 'conformance/f6/verify.mjs',
  'schemas/cuda-runtime-ir.schema.json', 'schemas/cuda-13.3/provenance.json',
  'schemas/cuda-13.3/tier-0/selection.json', 'schemas/cuda-13.3/tier-0/semantic-overlay.json',
  'schemas/cuda-13.3/linux-x64/generated/header-facts.json',
  'schemas/cuda-13.3/linux-x64/generated/native-layouts.json',
  'schemas/cuda-13.3/linux-x64/generated/runtime-ir.json',
  'schemas/cuda-13.3/linux-x64/generated/coverage-report.json',
  'schemas/cuda-13.3/linux-x64/generated/semantic-diff.json',
  'schemas/cuda-13.3/linux-x64/generated/conformance-fixture.json',
  'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
  'schemas/cuda-13.3/linux-x64/generated/types.d.ts',
  'schemas/cuda-13.3/linux-x64/generated/native-abi-probe.c',
  'schemas/cuda-13.3/linux-x64/generated/product-manifest.json',
  'schemas/cuda-13.3/win-x64/compatibility-manifest.json',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
  'tests/README.md', 'tools/README.md', 'packaging/README.md', 'third_party/README.md',
  'tools/cuda-schema/README.md', 'tools/cuda-schema/component.yaml',
  'tools/cuda-schema/src/pipeline.mjs',
  '.github/CODEOWNERS', '.github/pull_request_template.md', '.github/workflows/docs.yml',
  'scripts/verify-docs.sh', 'scripts/verify-docs.mjs', 'scripts/run-exp-000.mjs', 'scripts/run-f1b.mjs',
  'scripts/run-exp-001.mjs', 'scripts/run-exp-012.mjs', 'scripts/run-f3.mjs', 'scripts/run-f4.mjs', 'scripts/run-f5.mjs', 'scripts/run-f6.mjs',
];

for (const relative of required) {
  const target = path.join(root, relative);
  if (!existsSync(target) || (await stat(target)).size === 0) errors.push(`missing or empty required file: ${relative}`);
}

for (const relative of [
  'next_step.yaml',
  'docs/research/source-register.yaml',
  'docs/plans/2026-08-10-focus-branch-map.json',
  'experiments/exp-000/case-schema.json',
  'experiments/exp-000/generated/runtime-ir.json',
  'experiments/exp-001/profile.json',
  'schemas/cuda-runtime-ir.schema.json',
  'schemas/cuda-13.3/provenance.json',
  'schemas/cuda-13.3/tier-0/selection.json',
  'schemas/cuda-13.3/tier-0/semantic-overlay.json',
  'schemas/cuda-13.3/linux-x64/generated/header-facts.json',
  'schemas/cuda-13.3/linux-x64/generated/native-layouts.json',
  'schemas/cuda-13.3/linux-x64/generated/runtime-ir.json',
  'schemas/cuda-13.3/linux-x64/generated/coverage-report.json',
  'schemas/cuda-13.3/linux-x64/generated/semantic-diff.json',
  'schemas/cuda-13.3/linux-x64/generated/conformance-fixture.json',
  'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/product-manifest.json',
  'schemas/cuda-13.3/win-x64/compatibility-manifest.json',
  'tools/cuda-schema/component.yaml',
  'components/resource-registry/component.yaml',
  'components/driver-actor/component.yaml',
  'components/memory/component.yaml',
  'components/execution/component.yaml',
  'components/compiler-actor/component.yaml',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
  'package.json',
]) {
  try {
    JSON.parse(await readFile(path.join(root, relative), 'utf8'));
  } catch (error) {
    errors.push(`${relative}: invalid JSON: ${error.message}`);
  }
}

async function filesUnder(relative = '') {
  const absolute = path.join(root, relative);
  const output = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = path.join(relative, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) {
      if ([...ignoredDirectories].some((ignored) => child === ignored || child.startsWith(`${ignored}/`))) continue;
      output.push(...await filesUnder(child));
    } else if (entry.isFile()) {
      output.push(child);
    }
  }
  return output;
}

const files = await filesUnder();
const markdown = files.filter((file) => file.endsWith('.md') && !file.startsWith('docs/archive/'));
for (const relative of markdown.filter((file) => file.startsWith('docs/'))) {
  const text = await readFile(path.join(root, relative), 'utf8');
  if (!/^\*\*Status:\*\* (Accepted|Proposal|Research Note|Informational|Superseded)$/m.test(text)) {
    errors.push(`missing recognized status marker: ${relative}`);
  }
}

const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
for (const relative of markdown) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (!target || /^(https?:\/\/|mailto:|#)/.test(target)) continue;
    target = target.split('#', 1)[0].split('?', 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(path.join(root, relative)), target);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
      errors.push(`${relative}: link escapes repository: ${target}`);
    } else if (!existsSync(resolved)) {
      errors.push(`${relative}: missing link target: ${target}`);
    }
  }
}

const staleNeedles = {
  'docs/decisions/ADR-0002-minimal-native-bootstrap-and-jit-call-surface.md': 'competing active ADR',
  'docs/assessments/': 'stale assessment path',
  'docs/research/2026-08-10-source-register.json': 'stale source register path',
  'EXP-0001-node-ffi-cuda-smoke.md': 'stale experiment path',
  'EXP-0000-node-ffi-synthetic-abi.md': 'stale experiment id',
};
for (const relative of files.filter((file) =>
  /\.(md|json|ya?ml|mjs|js)$/.test(file) && file !== 'scripts/verify-docs.mjs')) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const [needle, label] of Object.entries(staleNeedles)) {
    if (text.includes(needle)) errors.push(`${relative}: ${label}: ${needle}`);
  }
}

const markers = {
  'README.md': ['Node-FFI-first', 'EXP-000', 'CJS-F1B', 'CJS-F2W', 'Windows x64'],
  'STATUS.md': ['Node 26.7.0', 'Windows x64', 'Linux x86-64', 'CJS-F1B', 'CJS-F2W', 'CJS-F6W', 'DriverActor'],
  'AGENTS.md': ['Node-FFI-first', 'fast-jit-required', 'EXP-000', 'EXP-001', 'EXP-012', 'CJS-F1B', 'active implementation phase'],
  'docs/FOUNDATION_INDEX.md': ['active implementation phase', 'agent_files/SYSTEM_REGISTRY.md', 'PROJECT_CHARTER.md'],
  'agent_files/SYSTEM_REGISTRY.md': ['experiment.exp-000', 'runtime.driver-actor', 'interop.umcgs'],
  'agent_files/AI_RULES.md': ['EXP-000', 'Apply token use as backpressure', 'Organize the repository as though it is already large'],
  'docs/plans/2026-08-10-master-plan.md': ['CJS-F0', 'CJS-F9', 'EXP-011'],
  'experiments/EXPERIMENT_MATRIX.md': ['EXP-000', 'EXP-001', 'EXP-011', 'EXP-012', 'Node FFI'],
  'next_step.yaml': ['CJS-F0', 'CJS-F1A', 'ADR-0002-node-ffi-first-host-binding.md'],
  'docs/specs/SPEC-0001-cuda-schema-compiler.md': ['CJS-F1B', 'fail-closed', 'native C layout probes'],
  'docs/specs/SPEC-0002-windows-driver-bootstrap.md': ['CJS-F2W', 'EXP-012', 'Deferred Linux path'],
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md': ['CJS-F3', 'runtime.driver-actor', 'runtime.resource-registry', 'Unexpected Worker loss'],
  'docs/specs/SPEC-0004-device-memory-foundation.md': ['CJS-F4', 'runtime.memory', 'device-memory', 'Native Windows'],
  'docs/specs/SPEC-0005-module-launch-completion.md': ['CJS-F5', 'runtime.execution', 'cuLaunchKernelEx', 'restart-required'],
  'docs/specs/SPEC-0006-compiler-linker-cache.md': ['CJS-F6', 'runtime.compiler-actor', 'nvJitLink', '--modify-stack-limit=false'],
  'schemas/README.md': ['cuda-runtime-ir.schema.json', 'cuda-13.3/tier-0/', 'generated/'],
};
for (const [relative, values] of Object.entries(markers)) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const value of values) if (!text.includes(value)) errors.push(`${relative} missing required architecture marker: ${value}`);
}

for (const relative of files) {
  const extension = path.extname(relative).toLowerCase();
  if (extension === '.py' || extension === '.pyc') errors.push(`prohibited source type: ${relative}`);
  if (['.node', '.ptx', '.cubin', '.fatbin', '.ltoir', '.so', '.dll', '.dylib', '.a', '.lib', '.o', '.obj', '.exe'].includes(extension)) {
    errors.push(`native/generated binary must remain in ignored build storage: ${relative}`);
  }
  if (['.c', '.h'].includes(extension)
      && !relative.startsWith('experiments/exp-000/generated/')
      && !relative.startsWith('experiments/exp-001/generated/')
      && !relative.startsWith('experiments/exp-012/generated/')
      && !relative.startsWith('conformance/f4/native/')
      && !relative.startsWith('conformance/f5/native/')
      && !relative.startsWith('experiments/exp-009/native/')
      && relative !== 'schemas/cuda-13.3/linux-x64/generated/native-abi-probe.c') {
    errors.push(`C source is outside a registered generated-source boundary: ${relative}`);
  }
  if (['.cc', '.cpp', '.cxx', '.hh', '.hpp', '.ts', '.tsx', '.rs'].includes(extension)
      && relative !== 'schemas/cuda-13.3/linux-x64/generated/types.d.ts') {
    errors.push(`source type is outside a currently registered implementation boundary: ${relative}`);
  }
  if (['.js', '.mjs', '.cjs'].includes(extension)
      && !relative.startsWith('experiments/exp-000/')
      && !relative.startsWith('experiments/exp-001/')
      && !relative.startsWith('experiments/exp-012/')
      && !relative.startsWith('experiments/exp-009/')
      && !relative.startsWith('components/resource-registry/')
      && !relative.startsWith('components/driver-actor/')
      && !relative.startsWith('components/memory/')
      && !relative.startsWith('components/execution/')
      && !relative.startsWith('components/compiler-actor/')
      && !relative.startsWith('conformance/f3/')
      && !relative.startsWith('conformance/f4/')
      && !relative.startsWith('conformance/f5/')
      && !relative.startsWith('conformance/f6/')
      && !relative.startsWith('scripts/')
      && !relative.startsWith('tools/cuda-schema/')
      && !relative.startsWith('schemas/cuda-13.3/linux-x64/generated/')) {
    errors.push(`JavaScript source is outside an authorized F1A/F1B/F2L-preparation/F2W/F3 boundary: ${relative}`);
  }
}

const workflows = files.filter((file) => file.startsWith('.github/workflows/')).sort();
if (JSON.stringify(workflows) !== JSON.stringify(['.github/workflows/docs.yml'])) {
  errors.push(`unexpected workflow set in the accepted Windows F2W / deferred Linux F2L phase: ${JSON.stringify(workflows)}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('CUDA-JS documentation, links, structured data, authority, source boundaries, promoted EXP-000/EXP-009, accepted F1B/F2W/F3W/F4W/F5W/F6W, and retained Linux native handoff checks passed');
