import * as semaphore from 'ciorent/semaphore';
import * as co from 'ciorent';

// Only allow 2 task to run concurrently
const sem = semaphore.init(2);

const task = async (id: number) => {
  // Acquire the semaphore or wait for the semaphore to be available
  await semaphore.acquire(sem);

  console.log('Task', id, 'started');

  // Let the main thread schedules other tasks
  for (let i = 1; i <= 5; i++) await co.nextTick;

  console.log('Task', id, 'end');

  // Release the semaphore
  semaphore.release(sem);
}

// Try to run 5 tasks concurrently
co.spawn(5, task);
