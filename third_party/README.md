# Third Party

External material requires exact origin, revision, license, modifications, update policy, security review, and artifact disposition.

Version-zero CUDA-JS has no accepted vendored runtime dependency and no accepted AsmJit dependency. Node's built-in FFI is a runtime/platform prerequisite, not vendored project source. Official CUDA headers and documentation are imported only under an explicit provenance and distribution decision.

Current prior-art references and exact revisions are recorded in [`../docs/research/source-register.yaml`](../docs/research/source-register.yaml). Implementation reuse from Node, RAPIDS, `sammwyy/cuda.js`, or any other project requires a separate license and design decision.

F1B pins NVIDIA's official Ubuntu 24.04 `cuda-cudart-dev-13-3` package at version `13.3.29-1` and verifies the package, `cuda.h`, `cudaTypedefs.h`, and package license hashes recorded in [`../schemas/cuda-13.3/provenance.json`](../schemas/cuda-13.3/provenance.json). The package and headers remain ignored, reacquirable build inputs. CUDA-JS does not vendor or redistribute them in this phase; public release remains subject to explicit legal review.

Windows F2W uses the installed official CUDA Toolkit 13.3 header and import library only as verified build/oracle inputs, plus the system NVIDIA Driver as a runtime prerequisite. Their exact hashes are recorded in [`../schemas/cuda-13.3/win-x64/compatibility-manifest.json`](../schemas/cuda-13.3/win-x64/compatibility-manifest.json) and ignored evidence; CUDA-JS does not redistribute them.
