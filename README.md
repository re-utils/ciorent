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
import * as co from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

// Expensive sync task
const task1 = async () => {
  let x = 0;

  // Simulate heavy operation
  for (let i = 0, l = (Math.random() + 15) * 1e6; i < l; i++) {
    // Yield control back occasionally to the runtime, allowing
    // it to schedule other tasks
    if (i % 1e5 === 0) await co.nextTick;

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
Cross-runtime synchronous and asynchronous sleep functions.
```ts
import * as co from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

logTime('Start');

// Non-blocking
await co.sleep(500);
logTime('After about 0.5s');

// This blocks the event loop
// On the browser this only works in workers and blocks the worker thread
co.sleepSync(500);
logTime('After another 0.5s');
````

### Semaphores
Semaphore is a concurrency primitive used to control access to a common resource by multiple processes.
```ts
import * as semaphore from 'ciorent/semaphore';
import * as co from 'ciorent';

// Only allow 2 task to run concurrently
const sem = semaphore.init(2);

const task = async (id: number) => {
  // Acquire the semaphore or wait for the semaphore to be available
  await semaphore.acquire(sem);

  console.log('Task', id, 'started');

  // Let the main thread schedules other tasks
  for (let i = 1; i <= 5; i++) await co.nextTick;

  console.log('Task', id, 'end');

  // Release the semaphore
  semaphore.release(sem);
};

for (let i = 1; i <= 5; i++) task(i);
```

### Fibers
Virtual threads with more controlled execution.
```ts
import * as co from 'ciorent';
import * as fiber from 'ciorent/fiber';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

const f1 = fiber.fn(function* () {
  // Wait for a promise
  console.log('Fiber 1 waiting: 1s');
  yield co.sleep(1000);

  // Wait for a promise and return its result
  const res = yield* fiber.unwrap(Promise.resolve(1));
  console.log('Fiber 1 recieved:', res);

  return Math.random();
});

{
  // Start the fiber process on next event loop cycle
  const main = fiber.spawn(function* (proc) {
    // Start f1, wait for the process to complete and get the result
    console.log('Fiber 2: joins fiber 1');
    const res = yield* fiber.join(fiber.spawn(f1));
    console.log('Fiber 2 recieved:', res);

    // Start f1 and make its lifetime depends on current fiber
    console.log('Fiber 2: spawns fiber 1');
    const childProc = fiber.spawn(f1);
    fiber.mount(childProc, proc);
  });

  console.log('Fiber 2 started:', fiber.running(main));

  // Wait for the fiber process to finish
  await fiber.complete(main);

  // Check finish status
  console.log('Fiber 2 completed:', fiber.completed(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  console.log('Fiber 1 started:', fiber.running(main));

  // Interrupt a fiber
  fiber.interrupt(main);

  // Execution will be stopped on the last yield
  await fiber.complete(main);

  console.log('Fiber 1 interrupted:', fiber.interrupted(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  logTime('Fiber 1 started');

  // Wait for a time period then interrupt the fiber
  fiber.timeout(main, 500);
  await fiber.complete(main);

  logTime('Fiber 1 interrupted');
}
```
