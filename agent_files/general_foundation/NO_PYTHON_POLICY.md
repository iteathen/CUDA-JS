# UMCGS Ecosystem No-Python Policy

**Status:** Accepted

**Policy ID:** `UMCGS-ECO-LANG-001`

**Scope:** `iteathen/UMCGS`, `iteathen/CUDA-JS`, and every future repository, package, installer, tool, integration project, benchmark project, or extracted component whose primary purpose is to build, test, package, release, operate, or extend the UMCGS ecosystem.

## Rule

Python is not an allowed project language, toolchain dependency, or execution dependency anywhere in scope.

The prohibition covers the entire project lifecycle, including:

- production, reference, example, experimental, prototype, migration, diagnostic, and maintenance source;
- build orchestration, schema import, code generation, artifact conversion, packaging, installation, release, and cleanup;
- unit, integration, conformance, benchmark, fuzz, property, performance, and acceptance testing;
- documentation generation or validation, repository automation, CI, local developer tooling, and one-off scripts;
- bootstrap, recovery, incident-response, data preparation, and temporary or local-only work;
- vendored, submodule, containerized, or indirectly invoked tooling that requires Python for an ordinary build, test, run, package, or release path.

A task does not gain an exception because the Python use is described as temporary, disposable, generated, CI-only, local-only, experimental, or hidden behind another command.

## Prohibited artifacts and invocations

Do not add or require:

- Python source or notebook artifacts such as `*.py`, `*.pyi`, `*.pyx`, or `*.ipynb`;
- Python project/dependency files such as `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements*.txt`, `Pipfile*`, `poetry.lock`, `uv.lock`, `tox.ini`, `noxfile.py`, or Conda environment manifests;
- invocations of `python`, `python3`, `py`, `pip`, `pip3`, `uv`, `poetry`, `conda`, or another Python interpreter/package manager;
- shell, PowerShell, Node.js, CMake, build-system, container, workflow, or installer wrappers whose purpose is to invoke Python;
- generated Python bindings, schemas, fixtures, test clients, or support packages;
- third-party project dependencies whose normal use in this ecosystem requires a Python runtime or Python tooling.

An opaque prebuilt external artifact or service is not automatically prohibited merely because its supplier may have used Python internally. It is acceptable only when this ecosystem does not install, invoke, vendor, expose, or depend on Python to consume, build, test, package, release, or operate it.

## Replacement rule

Use a language and toolchain already accepted by the owning repository and boundary. Typical replacements may include:

- Node.js with JavaScript or TypeScript for host orchestration, schema tooling, generators, tests, and developer tools;
- C, C++, CUDA, PTX, or another explicitly accepted native/device language for ABI, runtime, and device work;
- shell or PowerShell only for thin task entry points rather than substantive application logic;
- JSON, YAML, or another accepted declarative format for durable schemas and records.

These examples do not authorize implementation or a language by themselves. The owning charter, ADR, specification, phase gate, and component contract still govern the choice.

Do not mechanically translate a Python design into another language while preserving Python-shaped ownership, process, packaging, or runtime assumptions. Redesign the work for the accepted host, native, device, and repository boundaries.

## Validation and review

Python introduction is a hard policy failure, not a style preference.

Before accepting a plan, branch, pull request, release, experiment, or repository split, inspect the affected:

- file names and extensions;
- dependency and package manifests;
- build, test, benchmark, generator, documentation, installer, and release commands;
- workflows, containers, hooks, and developer setup instructions;
- vendored tools, submodules, generated products, and transitive ordinary-use requirements.

A proposal that depends on Python must be rejected or redesigned before implementation. Tests or workflows may not install Python merely to make validation easier.

Prose may mention Python when recording this prohibition, explaining historical provenance, comparing rejected alternatives, or documenting removal. Executable examples or instructions that require Python remain prohibited.

Any Python artifact or dependency discovered later is not grandfathered. Freeze its use, determine provenance and dependents, preserve evidence where needed, and remove, replace, or archive it under the normal cleanup and change-management rules.

## Cross-repository inheritance

- Every new UMCGS-related repository adopts this policy before code-bearing work begins.
- Repository topology and project charters must identify the policy as an ecosystem-wide invariant.
- Application profiles may add stricter language constraints but may not permit Python.
- A substantive policy change must be coordinated across UMCGS and CUDA-JS so their accepted authority does not drift.
- No agent, plan, experiment, contributor, dependency, or convenience may infer an exception. Only an explicit project-owner instruction that deliberately changes this accepted policy can do so.
