# Public Repository Hardening

**Status:** Informational

**Updated:** 2026-08-26

CUDA-JS is public at `iteathen/CUDA-JS`. This document records the public-repository security and collaboration posture, the assessment behind the hardening pass, and external control evidence that is not represented by source files.

## Current public facts

As of the exact repository state inspected for this hardening pass:

- the repository is public and `main` is the default branch;
- `main` is protected;
- the protected branch requires the `verify`, `schema`, and `node-compatibility` status contexts;
- CODEOWNERS routes repository ownership to `@iteathen`;
- repository metadata identifies CUDA-JS as an experimental Windows-first Node/CUDA runtime and publishes CUDA/Node/NVRTC/nvJitLink-related topics;
- repository license detection is GNU AGPL v3, with `LICENSING.md` documenting the `AGPL-3.0-or-later` and separately negotiated commercial-license model;
- public pull-request workflows execute portable/generated/reference checks only; native Windows qualification remains separate exact-profile evidence;
- every remote GitHub Action is pinned to a reviewed full commit SHA with a same-line release tag, while repository-local actions remain same-commit source and remote reusable workflows follow the same immutable rule;
- Dependabot checks the `github-actions` ecosystem weekly and opens at most three concurrent update pull requests;
- GitHub private vulnerability reporting is **enabled**; authenticated API read-back returned `{"enabled":true}` on 2026-08-26, and the unauthenticated Security page exposed the repository's private-report URL.

The remaining end-to-end acceptance item on issue #68 is an unaffiliated reporter submission followed by maintainer management of the resulting private advisory. Setting/read-back and entry-point evidence do not fabricate that two-party proof.

## Assessment

### Outcome

Keep CUDA-JS safe and understandable as a public engineering repository without changing runtime behavior, API contracts, platform-support claims, release status, or CUDA-MCGS ownership boundaries.

### Non-goals

This hardening pass does not:

- publish a new package or release;
- broaden Windows/Linux/Node/GPU support;
- change CUDA runtime, compiler, memory, execution, or LTO semantics;
- add repository secrets or privileged public-PR automation;
- claim OS-process isolation or exploit resistance beyond existing evidence;
- replace the accepted engineering/security doctrine under `agent_files/`.

### Governing authority

- [`../AGENTS.md`](../AGENTS.md)
- [`../agent_files/AI_RULES.md`](../agent_files/AI_RULES.md)
- [`../agent_files/general_foundation/SECURITY.md`](../agent_files/general_foundation/SECURITY.md)
- [`../agent_files/general_foundation/ASSESSMENT_AND_PLANNING.md`](../agent_files/general_foundation/ASSESSMENT_AND_PLANNING.md)
- [`../agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md`](../agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md)
- [`../agent_files/VALIDATION_POLICY.md`](../agent_files/VALIDATION_POLICY.md)

### Strongest credible failure modes

1. **Dead security channel.** Public issue configuration must not send a reporter to a private flow unless the GitHub control is enabled and periodically read back.
2. **Over-privileged public CI.** A pull-request workflow inherits more `GITHUB_TOKEN` authority than it needs.
3. **Accidental local-secret commits.** Common `.env`, private-key, credential-config, or certificate files are not ignored by default.
4. **Unowned public-security policy.** A root security policy exists without registry/validation ownership and silently drifts.
5. **Security policy overclaim.** Documentation implies a private reporting mechanism or native security guarantee that is not actually enabled/proven.
6. **Mutable CI dependency.** A tag, branch, short SHA, unreviewed remote action, or stale release comment silently changes code executed by public CI.

### Selected path

Use the smallest source-controlled hardening set that addresses those failures:

- add a root `SECURITY.md` with fail-safe reporting instructions;
- point issue-menu security routing to the enabled private advisory URL and keep `SECURITY.md` as canonical policy;
- explicitly set public CI workflows to read-only repository permission;
- add defense-in-depth ignore patterns for common secret-bearing local files;
- make the security policy a required validated repository file and register its owner;
- pin remote Actions to reviewed full SHAs, record their release/license provenance, reject dependency drift, and let Dependabot propose bounded reviewable updates;
- surface security/public-repository guidance from README, CONTRIBUTING, and the documentation index;
- record enabled-setting read-back separately from the still-required unaffiliated-reporter/advisory-management proof.

The alternative of creating a custom email address, webhook, or external reporting service is rejected because GitHub now supplies the repository-owned private workflow and no second durable secure endpoint is needed.

## Public CI trust model

Public pull-request workflows should use least authority. Unless an explicitly reviewed job needs more, workflow-level permissions should remain:

```yaml
permissions:
  contents: read
```

Do not expose repository secrets to untrusted pull-request code. Do not add `pull_request_target` execution of PR-controlled code merely to obtain privileged automation.

The existing `verify`, `schema`, and `node-compatibility` checks are repository-quality evidence; they do not establish native CUDA support on untested platforms.

## GitHub Actions dependency policy

GitHub-hosted remote actions and remote reusable workflows must use a full 40-character commit SHA. The same `uses:` line must end with the reviewed release tag so humans and Dependabot retain a readable version identity. Repository-local actions and reusable workflows may use only normalized `./...` paths because they execute from the already reviewed repository commit; Docker `uses:` references are prohibited by the current policy.

The canonical machine-readable provenance owner is [`.github/actions-provenance.json`](../.github/actions-provenance.json). The current reviewed set below is a validated human-readable projection of that owner:

<!-- actions-provenance:start -->
| Dependency | Release | Immutable commit | Workflow inventory |
|---|---|---|---|
| [`actions/checkout`](https://github.com/actions/checkout/releases/tag/v7.0.1) | `v7.0.1` | [`3d3c42e5aac5ba805825da76410c181273ba90b1`](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1) | `.github/workflows/docs.yml`, `.github/workflows/node-compatibility.yml` |
| [`actions/setup-node`](https://github.com/actions/setup-node/releases/tag/v7.0.0) | `v7.0.0` | [`820762786026740c76f36085b0efc47a31fe5020`](https://github.com/actions/setup-node/commit/820762786026740c76f36085b0efc47a31fe5020) | `.github/workflows/docs.yml`, `.github/workflows/node-compatibility.yml` |
| [`actions/upload-artifact`](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) | `v7.0.1` | [`043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`](https://github.com/actions/upload-artifact/commit/043fb46d1a93c77aae656e7c1c64a875d1fc6a0a) | `.github/workflows/docs.yml` |
<!-- actions-provenance:end -->

`.github/dependabot.yml` checks for Action releases weekly. A proposed update is not accepted merely because the bot changed a SHA/comment: review the upstream release and commit in the source repository, confirm role/license/permissions and workflow behavior, update the provenance entry, then require the normal protected checks. `scripts/verify-public-repository.mjs` rejects mutable, undeclared, mismatched, expression-based, and prohibited Action references plus stale workflow inventory or update configuration.

## Security-reporting posture

The root [`SECURITY.md`](../SECURITY.md) is the canonical public reporting entry point.

With GitHub private vulnerability reporting enabled:

- do not publish exploit details, secrets, proof-of-concept payloads, or sensitive logs in a public issue;
- submit the report through [`/security/advisories/new`](https://github.com/iteathen/CUDA-JS/security/advisories/new);
- keep reproduction material and maintainer coordination inside the resulting private advisory.

If read-back or the public entry point regresses, remove any dead direct route and restore a safe policy-only route before requesting sensitive material.

## Public repository hygiene

- Never commit tokens, passwords, private keys, credentials, private endpoints, private user data, or captured environment secrets.
- `.gitignore` patterns are defense in depth, not a secret-management boundary.
- If a credential is exposed, revoke or rotate it; deletion or history rewriting alone is not remediation.
- Scrub logs, Actions artifacts, benchmark evidence, crash dumps, generated files, screenshots, and issue attachments before publication.
- Third-party code and substantial copied material require exact provenance and compatible licensing.
- Public documentation must distinguish exact qualified evidence from testing-unconfirmed behavior.

## External control evidence and periodic check

The repository owner maintains the private-reporting control. On 2026-08-26:

- the authenticated setting endpoint returned `{"enabled":true}`;
- an unauthenticated request to the public Security page returned HTTP 200 and exposed `/iteathen/CUDA-JS/security/advisories/new`;
- authenticated maintainer access to the repository security-advisory collection succeeded.

Recheck the setting and public entry point quarterly and before each release. Issue #68 remains open until an unaffiliated reporter and the maintainer complete the private reporter-to-advisory round trip without placing test vulnerability details in public state.

## Validation and acceptance

The source-controlled hardening change is accepted only when the exact PR head passes the existing protected public checks:

- `schema`;
- `verify`;
- `node-compatibility`.

Author-side review must also confirm that no runtime/source/support claim changed, the issue security link resolves to the canonical policy, workflow permissions are least-authority, the new policy is registered/validated, and no security reporting path is described as enabled when it is not.

A later private-vulnerability-reporting claim requires fresh remote read-back; source documentation alone cannot prove that setting is enabled or that the two-party flow works.
