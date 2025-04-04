import * as cio from 'ciorent';
import * as fiber from 'ciorent/fiber';

function* thread1() {
  console.log('Fiber 1 started');
  yield;
  console.log('Fiber 1 done');
}

function* thread2() {
  console.log('Fiber 2 started');

  yield;
  console.log('Fiber 2 resumed');

  // Wait for a promise
  yield* fiber.wait(cio.sleep(1000));
  console.log('Fiber 2 waited for 1s');

  // Start task 1 and wait for it to be done
  yield* fiber.join(
    fiber.start(thread1())
  );

  console.log('Fiber 2 done');
}

// Start running the thread
fiber.start(thread2());
