# Plan Execution

## Readiness proof

Execute only a node that is explicit, current, dependency-complete, correctly owned, and supported by current authority, repository state, environment, and runnable evidence.

## Before mutation

State:

- expected local and wider effects;
- acceptance criteria;
- cheapest decisive falsifier;
- rollback or safe stop;
- cleanup obligations;
- conditions requiring plan revision.

## Coherent operation

Apply one ownership-sized operation at a time. An operation may span several files; unrelated plan nodes must not be combined merely to reduce commands.

## Actual-effect inspection

Immediately inspect exact diffs, generated products, state transitions, resources, logs, and repository/remote effects. Compare actual with expected before continuing.

## Outcome classification

Classify as continue, accept, pause, revise, rollback, fail, or supersede. Changes to cause, owner, authority, public contract, schema/ABI, consequence horizon, resource model, risk, acceptance, rollback, output, downstream order, or cleanup are material deviations requiring plan revision.

## Acceptance

Do not accept while invalid partial state, competing authority, stale generated forms, abandoned resources, unresolved contradictions, unsafe residue, or false downstream preconditions remain.
