/* Generated from pinned NVIDIA headers by device-graph-facts.mjs. */
export const deviceGraphFfiDefinitions = Object.freeze({
  "cuGraphCreate": {
    "arguments": [
      "pointer",
      "u32"
    ],
    "return": "i32"
  },
  "cuGraphAddKernelNode_v2": {
    "arguments": [
      "pointer",
      "pointer",
      "pointer",
      "u64",
      "pointer"
    ],
    "return": "i32"
  },
  "cuGraphInstantiateWithFlags": {
    "arguments": [
      "pointer",
      "pointer",
      "u64"
    ],
    "return": "i32"
  },
  "cuGraphUpload": {
    "arguments": [
      "pointer",
      "pointer"
    ],
    "return": "i32"
  },
  "cuGraphLaunch": {
    "arguments": [
      "pointer",
      "pointer"
    ],
    "return": "i32"
  },
  "cuGraphExecDestroy": {
    "arguments": [
      "pointer"
    ],
    "return": "i32"
  },
  "cuGraphDestroy": {
    "arguments": [
      "pointer"
    ],
    "return": "i32"
  }
});
export const deviceGraphKernelNodeLayout = Object.freeze({
  "type": "CUDA_KERNEL_NODE_PARAMS_v2_st",
  "size": 72,
  "alignment": 8,
  "offsets": {
    "func": 0,
    "gridDimX": 8,
    "gridDimY": 12,
    "gridDimZ": 16,
    "blockDimX": 20,
    "blockDimY": 24,
    "blockDimZ": 28,
    "sharedMemBytes": 32,
    "kernelParams": 40,
    "extra": 48,
    "kern": 56,
    "ctx": 64
  }
});
export const deviceGraphFlags = Object.freeze({"deviceLaunch":4});
