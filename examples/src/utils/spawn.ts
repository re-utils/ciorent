import * as cio from 'ciorent';

const task = async (id: number) => {
  await cio.sleep(Math.random() * 20 + 50);
  console.log('Task', id, 'done');
}

// Spawn and run 5 tasks sequentially
console.log('Running sequentially:');
cio.sequential(5, task);

// Spawn and run 5 tasks concurrently
console.log('Running concurrently:');
cio.concurrent(5, task);

// Spawn and run 5 tasks, with the maximum
// tasks running concurrently set to 3
console.log('Running each 3 tasks concurrently:');
cio.concurrent(5, task, 3);
