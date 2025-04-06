import * as semaphore from 'ciorent/semaphore';
import * as cio from 'ciorent';

const task = semaphore.wrap(
  async (task: number) => {
    for (let i = 1; i <= 5; i++) {
      console.log('Task', task, 'iteration', i);
      await cio.pause;
    }

    console.log('Task', task, 'end');
  }
);

// Only allow 2 task to run concurrently
const sem = semaphore.init(2);

// Try to run 6 tasks concurrently
cio.concurrent(6, (sem, id) => task(sem, id), sem);
