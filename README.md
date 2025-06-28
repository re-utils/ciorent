A lightweight, low-overhead concurrency library.

## Features
- Micro-optimized utilities.
- Performance-oriented API design.
- Small bundle size.
- Fully type-safe.

## Examples

### Pausing
Continue the execution on next tick, allowing other asynchronous tasks to run.
```ts
import { nextTick } from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

// Expensive sync task
const task1 = async () => {
  let x = 0;

  // Simulate heavy operation
  for (let i = 0, l = (Math.random() + 15) * 1e6; i < l; i++) {
    // Yield control back occasionally to the runtime, allowing
    // it to schedule other tasks
    if (i % 1e5 === 0) await nextTick;

    x += Math.random() * 32 + i * Math.round(Math.random() * 16);
  }

  console.log('Task 1 result:', x);
};

// Short async task
const task2 = async (id: number) => {
  logTime('Task 2.' + id + ' start fetching');
  await fetch('http://localhost:3000').catch(() => {});
  logTime('Task 2.' + id + ' done fetching');
};

task1();

// Task 2 will not get blocked by task 1
for (let i = 1; i <= 5; i++) task2(i);
```

### Sleep
Runtime-agnostic synchronous and asynchronous sleep functions.
```ts
import { sleep, sleepSync } from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

logTime('Start');

// Non-blocking
await sleep(500);
logTime('After about 0.5s');

// This blocks the event loop
// On the browser this only works in workers and blocks the worker thread
sleepSync(500);
logTime('After another 0.5s');
```

### Latches
Latches are a type of synchronization primitive that allows one thread to wait until another thread completes an operation before continuing execution.
```ts
import { sleep, latch } from 'ciorent';

const startFetch = latch.init();

(async () => {
  // Wait until the latch is opened
  await latch.wait(startFetch);

  const res = await fetch('http://example.com');
  return res.text();
})();

// Fetch starts after 500ms
await sleep(500);
latch.open(startFetch);
```

### Semaphores
Semaphore is a concurrency primitive used to control access to a common resource by multiple processes.
```ts
import { semaphore, nextTick } from 'ciorent';

// Only allow 2 task to run concurrently
const sem = semaphore.init(2);

const task = async (id: number) => {
  // Acquire the semaphore or wait for the semaphore to be available
  await semaphore.acquire(sem);

  console.log('Task', id, 'started');

  // Let the main thread schedules other tasks
  for (let i = 1; i <= 5; i++) await nextTick;

  console.log('Task', id, 'end');

  // Release the semaphore
  semaphore.release(sem);
};

for (let i = 1; i <= 5; i++) task(i);
```

### Fibers
A module to interrupt executions of async functions.
```ts
import { signal, sleep } from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

const f1 = (async (sig: signal.Signal) => {
  // Wait for a promise
  console.log('Fiber 1 waiting: 1s');
  await sleep(1000);

  // Interruption point
  if (signal.interrupted(sig)) return;

  const res = Math.random();
  console.log('Fiber 1 result:', res);

  return res;
});

{
  console.log('------------------------');

  console.log('Fiber 1 started');
  const sig = signal.init();
  const promise = f1(sig);

  // Interrupt the signal
  signal.interrupt(sig);

  // Execution will be stopped on the last interruption point
  await promise;

  console.log('Fiber 1 interrupted');
}

{
  console.log('------------------------');

  logTime('Fiber 1 started');
  const sig = signal.init();
  const promise = f1(sig);

  // Timeout a signal after a duration
  signal.timeout(sig, 500);
  await promise;

  logTime('Fiber 1 interrupted');
}
```
