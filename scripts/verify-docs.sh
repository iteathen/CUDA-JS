#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

node_bin="${CUDA_JS_NODE:-}"
if [[ -z "$node_bin" ]]; then
  for candidate in \
    "$PWD/build/toolchains/node-v26.7.0-linux-x64/bin/node" \
    "$PWD/build/toolchains/node-v26.7.0-win-x64/node.exe"; do
    if [[ -x "$candidate" ]]; then
      node_bin="$candidate"
      break
    fi
  done
fi

if [[ -z "$node_bin" ]]; then
  node_bin="$(command -v node)"
fi

"$node_bin" --test scripts/current-state-contract.test.mjs
"$node_bin" scripts/current-state-contract.mjs
"$node_bin" --test scripts/public-capability-projection.test.mjs
"$node_bin" --test scripts/workflow-action-policy.test.mjs
"$node_bin" scripts/verify-docs.mjs
"$node_bin" scripts/run-f1b.mjs check
