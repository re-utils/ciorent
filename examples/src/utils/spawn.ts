import * as cio from 'ciorent';

const task = async (id: number) => {
  await cio.sleep(Math.random() * 20 + 50);
  console.log('Task', id, 'done');
}

// Spawn and run 5 tasks sequentially
console.log('Running 5 tasks sequentially:');
cio.sequential(5, task);

// Spawn and run 5 tasks concurrently
console.log('Running 5 tasks concurrently:');
cio.concurrent(5, task);
