# CUDA-JS Design Alignment Card

Use this compact card before accepting a material design or integration choice.

## 1. Purpose and bounds

- What exact problem and consumer-independent capability are owned here?
- What is explicitly outside the boundary?
- What ranges, precision, capacities, platforms, lifetimes, and failure tolerances are required?
- Which constraints are fundamental, and which are only observations from the first use case?

## 2. Value ordering

Set the contextual order before choosing a path. A typical critical native-runtime order is:

1. semantic and ABI correctness;
2. safety and capability containment;
3. ownership/lifetime/teardown correctness;
4. recoverability and honest failure classification;
5. compatibility and evolvability;
6. performance and latency;
7. developer usability and observability;
8. implementation simplicity and delivery speed.

The order may change by subsystem, but hard correctness/safety gates remain gates.

## 3. Architectural cascade

- **LEGO:** stable, universal, replaceable component boundaries and injected dependencies.
- **SOLID:** focused internal responsibilities and dependency inversion.
- **CUPID:** composable, predictable, idiomatic, domain-aligned developer experience.
- **KISS:** simplest sufficient total lifecycle after fundamentals are satisfied.

## 4. Foundation checks

- Domain-appropriate types, units, ranges, alignment, and identity.
- Maximum accurate generality without pretending unsupported universality.
- Explicit inputs, outputs, effects, ownership, state transitions, pressure, failure, cancellation, and cleanup.
- Public contracts do not leak private Node FFI, Worker, pointer, library-path, or provider-layout choices.
- Generated facts and reviewed semantics remain separately owned.
- Compatibility identity includes every material schema, generator, Node/ABI, Driver/toolkit, GPU, provider, option, and artifact input.

## 5. Evidence and integration

- Strongest counterexample and cheapest decisive falsifier identified.
- Independent oracle defined where native/generated behavior is involved.
- Caller, dependency, lifecycle, error, security, performance, compatibility, and cleanup consequences reconciled.
- Claim limits state exactly what remains unproved.
