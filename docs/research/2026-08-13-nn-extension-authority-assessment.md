# Optional NN Extension Authority Assessment

**Status:** Research Note

**Date:** 2026-08-13

## Frozen question

```text
repository:     iteathen/CUDA-JS
protected main: 7ba8e07db76f2b18dd97d344698bd2d90a41c9de
package:        cuda-js@0.1.0-alpha.5
work package:   issue #71
environment:    Linux x64, exact Node 26.7.0 available, no NVIDIA Driver/GPU
claim:          product/package/component authority only
```

Project-owner direction selects an optional neural-network training product while preserving the generic CUDA-JS runtime and toolchain. The decision question is where that product belongs and which boundary prevents its semantics, dependencies, native providers, and release lifecycle from leaking into the existing core package.

The pre-assessment suggestion was a same-package `cuda-js/nn` subpath. This note tests that suggestion rather than treating it as the conclusion.

## Existing authority conflict

Before this packet, the accepted charter and agent entry points excluded tensor, model, graph, autodiff, and training semantics project-wide. Issues #70–#84 described a layered extension, but issue text and plans do not authorize production code.

Any selected path must preserve these invariants:

- generic CUDA-JS core remains independently installable, importable, testable, and useful;
- no NN requirement widens raw-pointer, lifecycle, compatibility, failure, cleanup, or evidence authority in core;
- context-bound cuBLAS/cuDNN handles stay private, while cuBLASLt handle/plan ownership and every call over DriverActor-owned execution resources stay under an explicit private adapter/runtime owner;
- NN semantics do not enter DriverActor, CompilerActor, generic memory, execution, or Device-JS contracts;
- optionality is an install and dependency property, not merely a lazy-import claim.

## Candidate paths

### One package with a `cuda-js/nn` subpath

Node package `exports` can encapsulate entry points and prevent accidental deep imports. It does not create an independently installable unit. Files and ordinary or optional dependencies still belong to the one package manifest.

This path can prove that `import 'cuda-js'` does not evaluate NN code. It cannot prove that a core-only installation avoids NN files, provider dependencies, audit surface, or release coupling.

### A separate repository and package

A repository split gives the strongest lifecycle and release separation, but it duplicates governance, compatibility, conformance, and integration machinery before independent maintainership or cadence exists. It also makes coordinated early contract work more expensive without improving the already-required public dependency direction.

### One repository with a separate future publish unit

This path keeps early governance and integration co-located while giving installation, dependency, compatibility, deletion, and later release identity their own boundary. The existing `cuda-js` package remains the public dependency; the NN publish unit may use only accepted public contracts and cannot deep-import core components.

This is the selected path.

## Primary-source findings

Node 26.7 documents package `exports` as the definition and encapsulation of package entry points. That mechanism controls which subpaths consumers may resolve; it is not an installation boundary.

npm documents dependencies in each package manifest, optional dependencies as dependencies whose installation failure may be tolerated, optional peers as not automatically installed, and workspaces as multiple package roots managed in one repository. A separate publish unit is therefore the smallest boundary that can make dependency and installation isolation falsifiable.

NVIDIA documents cuBLAS handles as tightly coupled to the CUDA context current at creation and cuDNN handles as tied to the current CUDA device/context. cuBLASLt is different: its handle is generally not tied to a particular CUDA context, but creation/calls require the appropriate current device and its algorithms consume execution-context-affine streams, memory, and workspaces. Combined with the accepted rule that one DriverActor owns its private context, streams, memory, and raw children, those facts require provider calls against those resources to stay under that owner. A different actor with its own resources is not inherently invalid, but it would require a separate accepted resource/context/interop design and evidence.

The NN layer may select and plan provider operations. Creation/destruction of cuBLAS/cuDNN handles and every provider call over DriverActor-owned device/context/stream/memory/workspace state execute through a separately accepted generic adapter owned by that resource boundary. The adapter also owns cuBLASLt handle/plan lifetime and performs its calls under the required current device and borrowed execution resources. NN code may own logical lowering/source semantics; CompilerActor continues to own compilation, compiler-provider lifecycle, cache identity, and the accepted typed copied PTX/LTO/cubin artifact boundary.

## Strongest counterexample and cheapest falsifier

The strongest counterexample to the same-package design is one future NN-only provider dependency. If it enters the `cuda-js` manifest, every core-only install receives or attempts that dependency even when no consumer imports `cuda-js/nn`.

The cheapest current falsifier is structural:

- `package.json` must gain no NN export or dependency;
- the core package tarball must gain no NN publish-unit files;
- importing or packing core must not resolve NN code or perform provider discovery;
- the future NN package name must not be claimed before registry namespace control is verified.

## Component-ownership reassessment

Package isolation alone does not assign semantic owners. Three component shapes were tested: put NN concepts in generic core, let one facade own every concern, or define finite internal NN boundaries behind one facade. The first leaks domain semantics into unrelated consumers. The second makes tensor identity, operator meaning, graph transformation, provider resources, mutable training state, checkpoint format, and evidence share one lifecycle and compatibility owner even though they change and fail independently.

The selected shape therefore names separate planned anchors for facade, tensor, operator, graph, autodiff, memory plan, provider registry, cuBLASLt/cuDNN/generated providers, execution plan, training state, checkpoint, and conformance. `nn.operator` is a required owner because graph typing, autodiff rules, and provider lowering must consume one finite versioned operator vocabulary rather than silently define competing meanings. Provider anchors are separate because generated device code, cuBLASLt, and cuDNN have different ownership, compatibility, failure, lifecycle, licensing, and native-evidence obligations.

These are authority anchors, not directories. Operators extend through accepted schemas, providers through a finite registry, implementations through injected accepted contracts, and test doubles through a later conformance port. No component becomes a public deep-import subpath.

## Reassessment

Select a same-repository, separate-publish-unit architecture. Reserve only its future relative entry points `.` and `./compatibility`. Defer `./testing` until `nn.conformance` has an accepted mock-only public contract. Do not create public tensor, graph, provider, or other component subpaths; keep those behind one finite NN facade and provider registry.

The actual registry package name is intentionally unselected. `@cuda-js/nn` cannot be assumed without evidence that the project controls the `@cuda-js` namespace.

The first packet is authority-only. It creates no package root, workspace, export, dependency, component directory, provider discovery, tensor API, runtime command, native binding, or support claim.

## Claim limits

This assessment supports a product/package/component ownership decision. It does not prove:

- any NN API or implementation;
- CUDA library availability, ABI, context behavior, numerical behavior, cleanup, or support;
- packaging of a future NN publish unit;
- a registry package name;
- training correctness, convergence, performance, or service safety.

## Sources

- [Node.js v26.7.0 packages documentation](https://nodejs.org/download/release/v26.7.0/docs/api/packages.html)
- [npm package.json documentation](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
- [NVIDIA cuBLAS 13.3 documentation](https://docs.nvidia.com/cuda/archive/13.3.0/cublas/index.html)
- [NVIDIA cuDNN Backend 9.17.1 API](https://docs.nvidia.com/deeplearning/cudnn/backend/v9.17.1/api/cudnn-graph-library.html)
