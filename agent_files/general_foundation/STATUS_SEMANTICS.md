# Status Semantics and Drift Prevention

## Purpose

Status words are part of the system contract. Ambiguous status language can turn a temporary evidence boundary into an accidental architectural decision, so durable records must separate the dimensions they describe.

A status word speaks **only** to its named dimension. Agents must never infer architectural intent, implementation intent, priority, or support evidence from a status that belongs to another dimension.

## Required capability dimensions

For any material capability whose state is tracked durably, record the applicable dimensions independently:

### Architectural disposition

Describes whether the capability belongs in the intended architecture.

Allowed meanings:

- `planned` — selected direction; later contract/implementation work is intended;
- `deferred` — legitimate capability intentionally postponed;
- `unselected` — no architectural decision has been made;
- `rejected` — explicitly decided against by accepted authority, with rationale;
- `not-applicable` — the capability does not belong to this component/profile.

Only this dimension may be used to infer whether a capability is intended, postponed, undecided, rejected, or irrelevant.

### Implementation status

Describes whether code exists for the capability.

Use explicit terms such as:

- `not-implemented`;
- `experimental`;
- `partial`;
- `implemented`.

Implementation status does not establish qualification or architectural desirability.

### Qualification/support status

Describes evidence for a named profile or public support claim.

Use explicit terms such as:

- `not-qualified` — no qualifying evidence exists;
- `testing-unconfirmed` — operation may be allowed, but support is not established;
- `qualified` — the exact named profile passed its required evidence;
- `known-incompatible` — the exact named profile is proven incompatible;
- `not-applicable`.

`unsupported` or `not supported` may be used in user-facing compatibility statements to mean **the named current release/profile does not provide a support claim**. It must not be interpreted as architectural rejection.

The legacy shorthand `no-support` is deprecated because it has been repeatedly misread. When encountered in historical material, interpret it as a qualification/public-support statement unless an accepted architectural decision separately says `rejected`.

### Priority / scheduling status

Describes when work should happen, not whether it belongs in the architecture.

Use explicit terms such as:

- `active`;
- `next`;
- `after:<dependency>`;
- `blocked:<dependency>`;
- `deferred`.

Priority never changes architectural disposition by implication.

## Scope language

Scope words are local unless they explicitly say otherwise.

- `does not authorize` means the named contract or phase does not grant implementation authority;
- `out of scope` means outside the named document/work package;
- `excluded from this slice` means excluded from that slice;
- `not currently public/qualified` describes the current public evidence surface.

None of those phrases means `architectural_disposition: rejected` unless accepted authority states that decision explicitly.

## Negative evidence

Negative evidence is profile-specific.

A verified failure such as “this exact Hyper-V host cannot expose a supported GPU partition” may justify `known-incompatible` for that exact profile. It does not reject virtualization, GPU partitioning, or another host profile architecturally.

## Issues and administrative states

GitHub issue state is administrative coordination, not architectural authority.

- Closing an issue as `not planned` must not be treated as architectural rejection unless the issue/comment links an accepted rejection decision.
- When work is superseded, prefer an explicit successor/duplicate disposition over language that implies the capability itself was rejected.
- Reopening an issue changes coordination state only; implementation still requires the applicable accepted contract and phase gate.

## Required change discipline

When a material capability changes state:

1. name the dimension that changed;
2. leave the other dimensions unchanged unless evidence or owner direction changes them too;
3. update the authoritative status owner and every generated/public projection that depends on it;
4. report any legacy wording that conflicts with the new state instead of silently interpreting it;
5. preserve historical accepted contracts while adding a clarification/amendment when their slice-local wording could be mistaken for a global decision.

## Example: concurrent launch

Correct:

```yaml
concurrent_launch:
  architectural_disposition: planned
  implementation_status: not-implemented
  qualification_status: not-qualified
  priority: after:submission-completion-separation
```

Also correct as a public statement:

> The current CUDA-JS release does not support multiple concurrent launches in one runtime.

Incorrect inference:

> “Not supported” means CUDA-JS has rejected concurrent launch as an architectural capability.

The first statement is a current support fact. The second is an architectural claim and requires separate accepted authority.
