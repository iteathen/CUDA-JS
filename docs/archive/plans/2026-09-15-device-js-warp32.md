# Issue #262: general-purpose GPU-resident warp voting

**Status:** Accepted

## Assessment and accepted plan

Owner: CUDA-JS Device-JS frontend. Starting revision:
`98e2ebc942c14d63acf4dd82e912dd548c363a05`. The project owner approved the
general-purpose, GPU-only implementation plan. The accepted child is
`../../specs/SPEC-0022-warp32-addendum.md`.

The invariant is exact warp identity and masked predicate exchange with explicit
participation. It survives deletion of every current consumer. This is a language
mechanism; algorithms, layouts and invocation scheduling remain outside its owner.
Width 32 is an explicit CUDA profile, not a universal data-width limit.

Rejected alternatives: implicit active-mask inference can change the intended
participant set; a full-warp-only API excludes valid subgroup use; host emulation
breaks device-owned progression; broad collective machinery exceeds this slice.

Execute in one isolated worktree and coherent PR: (1) contract/issue correction,
(2) frontend/lowering/composition, (3) neutral portable/native conformance,
(4) documentation/package reconciliation and remote preservation. Existing dirty
checkouts and unrelated worktrees are protected. No other repository is edited.

Key adversarial cases: multidimensional lane identity, sparse masks, divergent
participation, single argument evaluation, a warp library imported without direct
helpers, dense numeric composition, and legacy identity stability. Dynamic
participation is a caller obligation, not a false compiler safety promise.

Falsifier: incorrect lane/result bits, lost imported requirements, host-dependent
intermediate progress, changed non-warp generated output, or native resource leaks.
Stop the affected slice, repair the owning boundary, and rerun affected evidence.
Rollback is removal of this additive child while retaining prior contracts.

## Execution and disposition

The bounded implementation is complete: one pure warp-profile module supplies the
frontend and inspection vocabulary; the contract owner supplies one closed library
admission table to both frontend and public facade. No actor, allocation, lifecycle,
header, or scheduling owner was added. Existing compilation/linking/resource
boundaries are reused. The package candidate is `cuda-js@0.1.0-alpha.21`.

Validation passed:

- `./scripts/verify-docs.sh`;
- `npm run exp:000:build` then `npm run verify`;
- `npm run exp:012` then the complete `npm run verify:windows` chain;
- final `npm run f8:portable`, `npm run f8:native`, `npm run f8:verify`
  after the final resource-balance assertion and packaged documentation update;
- the F8 unit suite passed 125/125, including legacy byte/identity controls.

The retained [bounded native/portable evidence](../../../conformance/f8/evidence/warp32-2026-09-15.json)
records exact source hashes, tarball identity, compiler inputs, and terminal
resource counts. Native execution used Windows 11 x64, Node 26.7.0, CUDA 13.3,
driver 610.74 and a physical GTX 1660 Ti (compute_75). Direct, PTX-library and
Device-LTO paths compared 993,600 words across 45 launches, each with eight
dependent device rounds and no CPU-produced intermediate progress.

The review is author-side, not independent review. The project owner pre-approved
the PR after requesting live-GPU testing. Required remote checks and protected
integration remain separate transactions; #262 and its linked PR own their live
state. No other platform, performance, application readiness, registry publication,
or stable production support is inferred.

Build preparation initially exposed a missing experiment fixture; building its
existing owner resolved the prerequisite. The exact root redirect check required
normalizing the local Windows checkout's CRLF to the tracked LF bytes; no authority
content or test was changed. Regenerated tracked fixtures have no semantic diff.

Cleanup disposition: retain source/specs and the bounded evidence in Git; remove
task-generated build/package/install caches and diagnostic logs after verified
remote integration. Remove only the task worktree and feature branch after remote
read-back. Existing dirty checkout, other worktrees and unrelated remote branches
are protected unchanged. Post-integration verification is recorded on the PR,
avoiding a self-referential live commit field here.
