A low-overhead, cross-runtime concurrency library.

# Usage
Pausing to prioritize an asynchronous task:
```ts
import * as cio from 'ciorent';

// Expensive sync task
const task1 = async () => {
  let x = 0;
  for (let i = 0; i < (Math.random() + 15) * 1e7; i++) {
    // Occasional pausing
    if (i % 2e6 === 0)
      await cio.pause;

    x += Math.random() * 32 + i * Math.round(Math.random() * 16);
  }
  console.log('Finish task 1:', x);
};

// Short async task
const task2 = async () => {
  console.log('Fetch start', performance.now().toFixed(2) + 'ms');
  const txt = await fetch('http://example.com');
  console.log('Fetch status', txt.status);
};

// Task 2 will not get blocked by task 1
task1();
task2();
```

Sleep for a duration:
```ts
import * as cio from 'ciorent';

await cio.sleep(1000);
console.log('Slept for about 1s');
```

Go-like channels for synchronizations:
```ts
import * as channel from 'ciorent/channel';
import * as cio from 'ciorent';

const c = channel.init<number>();

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await cio.sleep(10);
    channel.send(c, i);
    console.log('Sent', i);
  }

  // Send the closed signal to the reciever
  // Or else channel.recieve will block forever
  channel.close(c);
};

const log = async () => {
  while (true) {
    // Non-blocking
    const x = await channel.recieve(c);

    // If the channel has been closed
    if (x === null) break;

    console.log('Recieved', x);
  };
}

run();
log();

// This runs first
console.log('Starting...');
```

## Latch
A latch is a synchronization tool that allows one or more threads to wait until a specific condition is met.

```ts
import * as latch from 'ciorent/latch';
import * as cio from 'ciorent';

const fetchLatch = latch.init();

const task = async () => {
  // Blocks until the latch is open
  await latch.pause(fetchLatch);

  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  console.log('Run before fetch:', performance.now().toFixed(2));

  // Unblock the latch
  latch.open(fetchLatch);
}

const main = async () => {
  const p = task();
  await cio.sleep(500);
  prepare();

  return p;
}

// Run fetch after 500ms
await main();

// Re-close the latch
latch.close(fetchLatch);

// Run fetch after another 500ms
await main();
```

If you don't need to close the latch again:
```ts
import * as latch from 'ciorent/latch';
import * as cio from 'ciorent';

const [pauseFetch, startFetch] = latch.init();

const task = async () => {
  // Blocks until the latch is open
  await pauseFetch;

  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  console.log('Run before fetch:', performance.now().toFixed(2));

  // Unblock the latch
  startFetch();
}

const main = async () => {
  const p = task();
  await cio.sleep(500);
  prepare();

  return p;
}

// Run fetch after 500ms
await main();
```

## Semaphore
A semaphore is a synchronization tool to control access to shared resources.

It's essentially a counter that regulates how many threads or processes can access a particular resource or section of code.

```ts
import * as semaphore from 'ciorent/semaphore';
import * as cio from 'ciorent';

// Only allow 2 of these tasks to run concurrently
const task = semaphore.task(
  semaphore.init(2),
  async (task: number) => {
    for (let i = 1; i <= 5; i++) {
      await cio.pause;
      console.log('Task', task, 'iteration', i);
    }

    await cio.sleep(500);
    console.log('Task', task, 'end');
  }
);

// Try to run 5 tasks concurrently
for (let i = 1; i <= 5; i++) task(i);
```
