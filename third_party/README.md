# Third Party

External material requires exact origin, revision, license, modifications, update policy, security review, and artifact disposition.

Version-zero CUDA-JS has no accepted vendored runtime dependency and no accepted AsmJit dependency. Node's built-in FFI is a runtime/platform prerequisite, not vendored project source. Official CUDA headers and documentation are imported only under an explicit provenance and distribution decision.

Current prior-art references and exact revisions are recorded in [`../docs/research/source-register.yaml`](../docs/research/source-register.yaml). Implementation reuse from Node, NVIDIA CUDA Python, RAPIDS, `sammwyy/cuda.js`, or any other project requires a separate license and design decision.
