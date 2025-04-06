import * as cio from 'ciorent';
import * as fiber from 'ciorent/fiber';

const thread1 = fiber.fn(function* () {
  console.log('Fiber 1 started');

  // Thread1 will be interrupted by thread2
  // As thread2 will end first
  yield cio.sleep(1000);

  console.log('Fiber 1 done');
});

const thread2 = fiber.fn(function* (thread) {
  console.log('Fiber 2 started');

  yield;
  console.log('Fiber 2 resumed');

  // Start thread 1 and make thread1
  // lifetime depends on thread2
  fiber.mount(fiber.spawn(thread1), thread);

  console.log('Fiber 2 done');
});

// Start running the thread
fiber.spawn(thread2);
