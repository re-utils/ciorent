# Ciorent
A low-overhead, cross-runtime concurrency library.

## Example usage
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

const c = channel.init<number>();
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const run = async () => {
  for (let i = 0; i < 10; i++) {
    await sleep(10);
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

Latches:
```ts
import latch from 'ciorent/latch';

const [startFetch, pauseFetch] = latch();

const task = async () => {
  // Blocks until the latch is open
  await pauseFetch;

  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  console.log('Run before fetch');

  // Unblock the latch
  startFetch();
}

task();
setTimeout(prepare, 500);
```
