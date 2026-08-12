# Public Repository Hardening

**Status:** Informational

**Updated:** 2026-08-12

CUDA-JS is already public at `iteathen/CUDA-JS`. This document records the public-repository security and collaboration posture, the assessment behind the current hardening pass, and the remaining GitHub-settings work that is not represented by source files.

## Current public facts

As of the exact repository state inspected for this hardening pass:

- the repository is public and `main` is the default branch;
- `main` is protected;
- the protected branch requires the `verify`, `schema`, and `node-compatibility` status contexts;
- CODEOWNERS routes repository ownership to `@iteathen`;
- repository metadata identifies CUDA-JS as an experimental Windows-first Node/CUDA runtime and publishes CUDA/Node/NVRTC/nvJitLink-related topics;
- repository license detection is GNU AGPL v3, with `LICENSING.md` documenting the `AGPL-3.0-or-later` and separately negotiated commercial-license model;
- public pull-request workflows execute portable/generated/reference checks only; native Windows qualification remains separate exact-profile evidence;
- GitHub private vulnerability reporting is currently **disabled**.

The last item is an operational gap: public issue routing must never imply that a private GitHub security channel exists when the repository setting is disabled.

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

1. **Dead security channel.** Public issue configuration sends a reporter to GitHub private vulnerability reporting while that feature is disabled, encouraging either a failed report or unsafe public disclosure.
2. **Over-privileged public CI.** A pull-request workflow inherits more `GITHUB_TOKEN` authority than it needs.
3. **Accidental local-secret commits.** Common `.env`, private-key, credential-config, or certificate files are not ignored by default.
4. **Unowned public-security policy.** A root security policy exists without registry/validation ownership and silently drifts.
5. **Security policy overclaim.** Documentation implies a private reporting mechanism or native security guarantee that is not actually enabled/proven.

### Selected path

Use the smallest source-controlled hardening set that addresses those failures:

- add a root `SECURITY.md` with fail-safe reporting instructions;
- point issue-menu security routing to `SECURITY.md` rather than a disabled advisory URL;
- explicitly set public CI workflows to read-only repository permission;
- add defense-in-depth ignore patterns for common secret-bearing local files;
- make the security policy a required validated repository file and register its owner;
- surface security/public-repository guidance from README, CONTRIBUTING, and the documentation index;
- keep enabling GitHub private vulnerability reporting as an explicit repository-settings follow-up because no connected write action currently owns that setting.

The alternative of leaving the current issue link in place is rejected because it advertises an unavailable security path. The alternative of creating a custom email address, webhook, or external reporting service is rejected because no such durable owner or secure endpoint was supplied.

## Public CI trust model

Public pull-request workflows should use least authority. Unless an explicitly reviewed job needs more, workflow-level permissions should remain:

```yaml
permissions:
  contents: read
```

Do not expose repository secrets to untrusted pull-request code. Do not add `pull_request_target` execution of PR-controlled code merely to obtain privileged automation.

The existing `verify`, `schema`, and `node-compatibility` checks are repository-quality evidence; they do not establish native CUDA support on untested platforms.

## Security-reporting posture

The root [`SECURITY.md`](../SECURITY.md) is the canonical public reporting entry point.

While GitHub private vulnerability reporting remains disabled:

- do not publish exploit details, secrets, proof-of-concept payloads, or sensitive logs in a public issue;
- open only a minimal public issue asking the maintainer to establish a private channel, with no vulnerability details;
- the maintainer should move the discussion to a private channel before requesting reproduction material.

When GitHub private vulnerability reporting is enabled, update/verify the issue-menu route and `SECURITY.md` so the repository points directly to the working private GitHub flow.

## Public repository hygiene

- Never commit tokens, passwords, private keys, credentials, private endpoints, private user data, or captured environment secrets.
- `.gitignore` patterns are defense in depth, not a secret-management boundary.
- If a credential is exposed, revoke or rotate it; deletion or history rewriting alone is not remediation.
- Scrub logs, Actions artifacts, benchmark evidence, crash dumps, generated files, screenshots, and issue attachments before publication.
- Third-party code and substantial copied material require exact provenance and compatible licensing.
- Public documentation must distinguish exact qualified evidence from testing-unconfirmed behavior.

## Remaining repository-settings action

Enable **GitHub private vulnerability reporting** for `iteathen/CUDA-JS`, then read back that the setting is enabled and verify the private reporting entry point works. This is the only public-repository hardening item identified by this pass that cannot be completed through the available connected GitHub write actions.

## Validation and acceptance

The source-controlled hardening change is accepted only when the exact PR head passes the existing protected public checks:

- `schema`;
- `verify`;
- `node-compatibility`.

Author-side review must also confirm that no runtime/source/support claim changed, the issue security link resolves to the canonical policy, workflow permissions are least-authority, the new policy is registered/validated, and no security reporting path is described as enabled when it is not.

A later change to the GitHub private-vulnerability-reporting setting requires remote read-back; source documentation alone cannot prove that setting is enabled.
