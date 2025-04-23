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
co.spawn(5, task2);
