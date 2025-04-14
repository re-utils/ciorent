import * as co from 'ciorent';

// Expensive sync task
const task1 = async () => {
  let x = 0;

  // Yield control back to the runtime, allowing it to
  // schedule other tasks
  await co.nextTick;

  // Simulate heavy operation
  for (let i = 0; i < (Math.random() + 15) * 1e6; i++)
    x += Math.random() * 32 + i * Math.round(Math.random() * 16);

  console.log('Finish task 1:', x);
};

// Short async task
const task2 = async () => {
  console.log('Start fetching...');
  const txt = await fetch('http://example.com');
  console.log('Fetch status', txt.status);
};

// Task 2 will not get blocked by task 1
task1();
task2();
