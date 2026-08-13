import { parentPort, workerData } from 'node:worker_threads';

if (!parentPort) throw new Error('EXP-014 mock device requires a Worker.');

const words = new Int32Array(workerData.buffer);
const durationTicks = workerData.durationTicks;
const failAtTick = workerData.failAtTick;
const intervalMilliseconds = workerData.intervalMilliseconds;
let ticks = 0;

parentPort.postMessage({ kind: 'ready' });

const timer = setInterval(() => {
  ticks += 1;
  Atomics.store(words, 1, ticks);
  if (failAtTick !== null && ticks >= failAtTick) {
    Atomics.store(words, 0, 2);
    clearInterval(timer);
    parentPort.close();
    return;
  }
  if (ticks >= durationTicks) {
    Atomics.store(words, 0, 1);
    clearInterval(timer);
    parentPort.close();
  }
}, intervalMilliseconds);
