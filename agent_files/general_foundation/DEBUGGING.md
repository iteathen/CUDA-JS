# Debugging Discipline

## Top-down triage

Ask:

- Is the design sound?
- Is the implementation faithful?
- What is the exact symptom and first observable boundary?
- What causes are plausible?
- Which cause is cheapest to falsify?
- Is the affected path hot, stateful, native, concurrent, generated, or cleanup-sensitive?

## Raw boundary trace

1. Pick one failing sample.
2. Pick one boundary.
3. Write the expected raw input/output/state before observing actual behavior.
4. Capture raw actual input/output/state.
5. Compare exactly.
6. Classify the mismatch.
7. Trace why the authoritative owner produced it.

Certainty and inconsistency are both useful outputs. Freeze evidence before mutation.

## Repair

Repair the owner of the incorrect fact, contract, transformation, state transition, lifetime, or assumption. Revalidate affected consumers and wider consequences. Do not patch downstream symptoms or change the specification merely because code disagrees.
