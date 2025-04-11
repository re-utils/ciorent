import * as semaphore from 'ciorent/semaphore';
import * as cio from 'ciorent';

// Only allow 2 task to run concurrently
const sem = semaphore.init(2);

const task = async (id: number) => {
  // Acquire the semaphore for this task
  // Or wait for the semaphore to be available
  await semaphore.pause(sem);

  console.log('Task', id, 'started');

  // Let the main thread schedules other tasks
  for (let i = 1; i <= 5; i++) await cio.pause;

  console.log('Task', id, 'end');

  // Release the semaphore
  semaphore.signal(sem);
}

// Try to run 5 tasks concurrently
cio.concurrent(5, task);
