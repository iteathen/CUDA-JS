import { runHyperVReadiness } from '../conformance/hardware/hyperv-readiness.mjs';

runHyperVReadiness().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
