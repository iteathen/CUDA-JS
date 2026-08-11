# Engineering Judgment

## Start from obligations

Translate the task into explicit obligations: purpose, owners, inputs, outputs, effects, invariants, ranges, lifecycle, failure, compatibility, performance, evidence, cleanup, and non-goals. Map each obligation to governing authority.

## Generate credible paths

For substantial decisions, consider at least:

- the strongest direct solution;
- a narrower contract or staged vertical slice;
- reuse of an existing platform capability;
- an experiment-first path where facts are uncertain;
- rejection or deferral when prerequisites are absent.

Do not compare a favored design against straw men.

## Adversarial pass

Use four roles:

1. **Proposer:** strongest case for the candidate.
2. **Adversary:** strongest failure cases, hidden assumptions, and downstream costs.
3. **Defender:** mitigations and evidence, without hand-waving.
4. **Integrator:** selects, combines, narrows, experiments, or rejects based on the full system.

## Contextual value ordering

After purpose and bounds are fixed, rank correctness, safety, recoverability, compatibility, performance, usability, architecture, simplicity, speed, and token cost for the specific subsystem. Record hard gates separately from optimizable values.

## Choose by total lifecycle

Evaluate construction, operation, pressure, failure, cancellation, observability, migration, compatibility, security, testing, cleanup, and future replacement. Local convenience is not a system optimum.

## Reasoning capability gate

When a material decision requires reasoning or evidence beyond the active capability, do not edit the critical boundary. Produce the bounded assessment, identify the missing fact or experiment, and stop at a safe documentation boundary.
