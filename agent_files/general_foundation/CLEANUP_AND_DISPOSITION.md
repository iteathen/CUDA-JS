# Cleanup and Disposition

Cleanup assigns every material item a verified disposition; it does not mean deleting everything.

## Inventory

Account for task-created, modified, superseded, partial, generated, diagnostic, local, remote, external, sensitive, and coordination state, including:

- files/directories and generated/build output;
- branches, worktrees, stashes, refs, PRs, issues, reviews;
- processes, ports, containers, locks, Workers, GPU/device state;
- credentials, permissions, temporary access;
- caches, artifacts, releases, packages, backups, persistence;
- external services and handoff records.

## Dispositions

Remove, restore, retain as authority/evidence/recovery, archive, quarantine, transfer, supersede, protect unchanged, or retain temporarily with an objective trigger.

## Destructive safeguards

Before destructive cleanup verify exact identity, owner, selector/working directory, dependents, authority, evidence/recovery need, expected effect, and decisive read-back. Use the narrowest selector and preview where possible.

Do not use broad recursive deletion, `git clean -fdx`, `git reset --hard`, stash destruction, force-push, protected/shared branch deletion, or remote-resource removal for cosmetic cleanliness.

## Historical value

Archive useful stale material with date, original location, reason, successor, and removal context. Deletion is not remediation for exposed secrets; revoke/rotate and inspect downstream copies.

## Cleanup debt

Permit only when immediate cleanup is less safe. It must be exact, contained, owned, protected from ordinary use, objectively triggered, independently actionable, and explicit about whether parent work is accepted.
