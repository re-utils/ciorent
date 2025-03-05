# Ciorent
A concurrency library.

## Example usage
Pausing to prioritize an asynchronous task:
```ts
import * as cio from 'ciorent';

// Expensive sync task
const task1 = async () => {
  let x = 0;
  for (let i = 0; i < (Math.random() + 15) * 1e7; i++) {
    // Frequent pausing
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
  do {
    // Non-blocking
    const x = await channel.recieve(c);
    if (x === channel.closed) break;
    console.log('Recieved', x);
  } while (true);
}

run();
log();

// This runs first
console.log('Starting...');
```
