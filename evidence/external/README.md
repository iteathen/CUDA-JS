# Independent CUDA-JS reproduction

This directory is reserved for reproducible native evidence produced outside the project-controlled qualification campaign.

## Minimal reproduction target

A useful first packet should demonstrate a bounded CUDA-JS native operation from Node without a compiled Node addon, on an explicitly supported profile.

Preserve:

- independent operator/system identity at the level appropriate for public evidence;
- CUDA-JS commit;
- Node and V8 versions;
- OS/architecture;
- NVIDIA GPU and driver;
- required runtime flags/toolchain;
- exact install/setup and execution commands;
- native operations exercised;
- stdout/stderr and structured result artifacts;
- observed failure/cleanup behavior;
- whether any local source modification was required.

If source modification is required, the result is not a clean reproduction of the pinned revision and must say so.

## Performance

Do not infer performance superiority from successful native execution. Performance packets require a defined workload, comparable baseline, raw samples, warmup/measurement method, and hardware/runtime provenance.

## Status

No external reproduction is promoted by this scaffold itself.
