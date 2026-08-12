import { parentPort, workerData } from 'node:worker_threads';

if (!parentPort) throw new Error('EXP-013 mock device requires a Worker.');

const words = new Int32Array(workerData.buffer);
const { multiplierLane, observationLane, stopLane } = workerData;
let ticks = 0;

function u32Load(index) { return Atomics.load(words, index) >>> 0; }
function u32Store(index, value) { Atomics.store(words, index, value | 0); }

const timer = setInterval(() => {
  if (u32Load(stopLane) !== 0) {
    clearInterval(timer);
    parentPort.postMessage({ kind: 'complete', ticks, observation: u32Load(observationLane) });
    parentPort.close();
    return;
  }
  const multiplier = Math.max(1, u32Load(multiplierLane));
  const next = (u32Load(observationLane) + multiplier) >>> 0;
  u32Store(observationLane, next);
  ticks += 1;
}, 5);
