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
