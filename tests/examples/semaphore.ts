import * as semaphore from 'ciorent/semaphore';
import * as cio from 'ciorent';

// Only allow 2 of these tasks to run concurrently
const task = semaphore.task(
  semaphore.init(2),
  async (task: number) => {
    for (let i = 1; i <= 5; i++) {
      console.log('Task', task, 'iteration', i);
      await cio.pause;
    }

    console.log('Task', task, 'end');
  }
);

Promise.all([
  task(1),
  task(2),
  task(3),
  task(4)
])

// Try to run 6 tasks with 4 task running concurrently
//cio.concurrent(6, task, 4);
