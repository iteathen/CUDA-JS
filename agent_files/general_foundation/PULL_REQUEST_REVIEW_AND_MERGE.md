# Pull Request Review and Merge

## Freeze review identity

Record repository, PR, target, exact head SHA, base/merge base, comparison range, review mode, and claim limits.

## Review substance

Inspect the complete diff and ancestry, affected context, current discussion, authority/plan fidelity, generated products, validation identity, compatibility, security, cleanup, and branch/coordination state. A PR description or green CI is not proof.

Every material PR receives complete author-side review and is labeled non-independent unless a genuinely independent reviewer performed it. Require independent review when owner instruction, protection/CODEOWNERS, phase, or consequence demands it. When the repository has exactly one maintainer/code owner and no genuinely independent authorized reviewer exists, the independent-review requirement is waived: record the sole-maintainer exception, preserve complete author-side review, and keep every other check and evidence gate unchanged.

## Blockers

Do not merge while required checks are pending/failed, blocking findings or threads remain, mergeability/target is unknown, evidence is invalidated, or material cleanup is unsafe/unowned. A head change invalidates affected approval; a material base change invalidates affected integration evidence.

## Guarded merge

Choose squash, rebase, or merge deliberately. Pre-release coherent results normally squash unless history structure matters. Merge only the exact accepted head using an expected-head guard where supported; never force-update the target. Do not bypass protection except for an approval-only gate made structurally impossible by the documented sole-maintainer exception; that exception does not permit bypassing required checks, unresolved findings, mergeability, cleanup, or exact-head guards.

## Post-merge verification

Verify resulting target SHA/tree, intended file set, checks, issue/claim state, source branch/worktree disposition, dependent work, permissions, artifacts, external resources, and cleanup debt. Do not claim completion before read-back.
