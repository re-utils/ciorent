import concurrent from 'ciorent/concurrent';
import * as cio from 'ciorent';

// Allow 3 tasks to run at the same time
const run = concurrent(3);

for (let id = 1; id <= 6; id++)
  run(async () => {
    await cio.sleep(Math.random() * 20 + 50);
    console.log('Task', id, 'done');
  });
