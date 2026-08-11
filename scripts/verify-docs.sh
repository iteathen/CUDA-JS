#!/usr/bin/env bash
set -euo pipefail
export PYTHONDONTWRITEBYTECODE=1
cd "$(dirname "${BASH_SOURCE[0]}")/.."

required=(
  README.md AGENTS.md STATUS.md next_step.yaml CONTRIBUTING.md
  agent_files/README.md agent_files/AGENTS.md agent_files/AI_RULES.md
  agent_files/DESIGN_ALIGNMENT_CARD.md agent_files/SYSTEM_REGISTRY.md agent_files/VALIDATION_POLICY.md
  agent_files/general_foundation/README.md
  agent_files/general_foundation/PRINCIPLES.md
  agent_files/general_foundation/ENGINEERING_JUDGMENT.md
  agent_files/general_foundation/ASSESSMENT_AND_PLANNING.md
  agent_files/general_foundation/PROJECT_ORGANIZATION.md
  agent_files/general_foundation/SPEC_AND_AGENT_FILE_READING.md
  agent_files/general_foundation/FOCUS_BRANCHES.md
  agent_files/general_foundation/PLAN_EXECUTION.md
  agent_files/general_foundation/TESTING.md
  agent_files/general_foundation/DEBUGGING.md
  agent_files/general_foundation/SANITY_CHECKING.md
  agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md
  agent_files/general_foundation/CLEANUP_AND_DISPOSITION.md
  agent_files/general_foundation/TOKEN_DISCIPLINE.md
  agent_files/general_foundation/DOCUMENTATION_GOVERNANCE.md
  agent_files/general_foundation/SECURITY.md
  agent_files/application_specific/CUDA_JS_PROFILE.md
  docs/README.md docs/FOUNDATION_INDEX.md docs/PROJECT_CHARTER.md docs/INTEROP_WITH_UMCGS.md
  docs/decisions/README.md
  docs/decisions/ADR-0001-repository-boundary.md
  docs/decisions/ADR-0002-node-ffi-first-host-binding.md
  docs/decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md
  docs/architecture/README.md
  docs/architecture/FRAMEWORK_OVERVIEW.md
  docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md
  docs/architecture/TARGET_ARCHITECTURE.md
  docs/architecture/V0_SUPPORT_MATRIX.md
  docs/plans/README.md
  docs/plans/2026-08-10-master-plan.md
  docs/plans/2026-08-10-focus-branch-map.json
  docs/specs/README.md docs/specs/SPEC-0000-runtime-contract-map.md
  docs/research/README.md
  docs/research/2026-08-10-technical-assumption-audit.md
  docs/research/2026-08-10-node-ffi-cuda-landscape.md
  docs/research/source-register.yaml
  docs/archive/README.md
  experiments/README.md experiments/EXPERIMENT_MATRIX.md
  experiments/EXP-000-node-ffi-synthetic-abi.md
  experiments/EXP-001-node-ffi-cuda-smoke.md
  benchmarks/README.md
  components/README.md schemas/README.md conformance/README.md
  tests/README.md tools/README.md packaging/README.md third_party/README.md
  .github/CODEOWNERS .github/pull_request_template.md .github/workflows/docs.yml
  scripts/check-doc-links.py
)

for f in "${required[@]}"; do
  [[ -s "$f" ]] || { echo "missing or empty required file: $f" >&2; exit 1; }
done

python3 - <<'PYJSON'
import json
from pathlib import Path
for path in (
    'next_step.yaml',
    'docs/research/source-register.yaml',
    'docs/plans/2026-08-10-focus-branch-map.json',
):
    json.loads(Path(path).read_text())
PYJSON

while IFS= read -r -d '' f; do
  grep -Eq '^\*\*Status:\*\* (Accepted|Proposal|Research Note|Informational|Superseded)$' "$f" || {
    echo "missing recognized status marker: $f" >&2; exit 1;
  }
done < <(find docs -type f -name '*.md' -print0)

python3 scripts/check-doc-links.py

python3 - <<'PYAUTH'
from pathlib import Path
active_roots = [
    Path('README.md'), Path('STATUS.md'), Path('AGENTS.md'), Path('CONTRIBUTING.md'),
    Path('agent_files'), Path('docs/architecture'), Path('docs/decisions'),
    Path('docs/plans'), Path('docs/specs'), Path('experiments'), Path('benchmarks'),
    Path('components'), Path('conformance'), Path('schemas'), Path('tests'),
    Path('tools'), Path('packaging'), Path('third_party'), Path('next_step.yaml'),
]
needles = {
    'docs/decisions/ADR-0002-minimal-native-bootstrap-and-jit-call-surface.md': 'competing active ADR',
    'docs/assessments/': 'stale assessment path',
    'docs/research/2026-08-10-source-register.json': 'stale source register path',
    'EXP-0001-node-ffi-cuda-smoke.md': 'stale experiment path',
    'EXP-0000-node-ffi-synthetic-abi.md': 'stale experiment id',
}
for root in active_roots:
    paths = [root] if root.is_file() else list(root.rglob('*')) if root.exists() else []
    for p in paths:
        if not p.is_file() or 'docs/archive' in p.as_posix():
            continue
        try:
            text = p.read_text()
        except UnicodeDecodeError:
            continue
        for needle, label in needles.items():
            if needle in text:
                raise SystemExit(f'{p}: {label}: {needle}')

checks = {
  'README.md': ['Node-FFI-first', 'docs/decisions/ADR-0002-node-ffi-first-host-binding.md', 'docs/plans/2026-08-10-master-plan.md'],
  'STATUS.md': ['Node 26', 'DriverActor', 'CompilerActor'],
  'AGENTS.md': ['Node-FFI-first', 'fast-jit-required', 'EXP-000', 'EXP-001', 'documentation-only foundation phase'],
  'docs/FOUNDATION_INDEX.md': ['documentation-only foundation phase', 'agent_files/SYSTEM_REGISTRY.md', 'PROJECT_CHARTER.md'],
  'agent_files/SYSTEM_REGISTRY.md': ['Planned boundaries and reserved directories are not implementation authorization', 'runtime.driver-actor', 'interop.umcgs'],
  'agent_files/AI_RULES.md': ['current phase is documentation only', 'Apply token use as backpressure', 'Organize the repository as though it is already large'],
  'agent_files/DESIGN_ALIGNMENT_CARD.md': ['LEGO', 'SOLID', 'CUPID', 'KISS', 'Domain-appropriate'],
  'agent_files/general_foundation/README.md': ['ASSESSMENT_AND_PLANNING.md', 'TOKEN_DISCIPLINE.md', 'PULL_REQUEST_REVIEW_AND_MERGE.md'],
  'docs/decisions/README.md': ['ADR-0002-node-ffi-first-host-binding.md', 'ADR-0003-generated-abi-facts-and-semantic-overlays.md'],
  'docs/architecture/TARGET_ARCHITECTURE.md': ['DriverActor', 'CompilerActor', 'portable-bootstrap', 'fast-jit-required'],
  'docs/plans/2026-08-10-master-plan.md': ['CJS-F0', 'CJS-F9', 'EXP-011'],
  'experiments/EXPERIMENT_MATRIX.md': ['EXP-000', 'EXP-001', 'EXP-011', 'Node FFI'],
  'next_step.yaml': ['CJS-F0', 'CJS-F3', 'ADR-0002-node-ffi-first-host-binding.md'],
}
for path, values in checks.items():
    text = Path(path).read_text()
    for value in values:
        if value not in text:
            raise SystemExit(f'{path} missing required architecture marker: {value}')
PYAUTH

python3 - <<'PYSOURCE'
from pathlib import Path

forbidden_suffixes = {
    '.c', '.cc', '.cpp', '.cxx', '.h', '.hh', '.hpp',
    '.js', '.mjs', '.cjs', '.ts', '.tsx', '.rs', '.node',
    '.ptx', '.cubin', '.fatbin', '.ltoir', '.so', '.dll', '.dylib', '.a', '.lib', '.o', '.obj',
}
allowed = {
    Path('scripts/check-doc-links.py'),
}
for path in Path('.').rglob('*'):
    if not path.is_file() or '.git' in path.parts:
        continue
    if path in allowed:
        continue
    if path.suffix.lower() in forbidden_suffixes:
        raise SystemExit(f'unauthorized implementation or native artifact in documentation-only phase: {path}')

workflows = sorted(Path('.github/workflows').glob('*'))
expected = [Path('.github/workflows/docs.yml')]
if workflows != expected:
    raise SystemExit(f'unauthorized workflow set in documentation-only phase: {workflows}')
PYSOURCE

printf 'CUDA-JS documentation foundation, link, JSON, authority, and source-boundary checks passed\n'
