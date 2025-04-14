import * as co from 'ciorent';
import * as fiber from 'ciorent/fiber';

const f1 = fiber.fn(function* () {
  // Wait for a promise
  yield co.sleep(1000);

  // Wait for a promise and return its result
  const res = yield* fiber.unwrap(Promise.resolve(1));
  console.log('Fiber 1 recieved:', res);

  return Math.random();
});

{
  const main = fiber.spawn(function* (proc) {
    // Start f1, wait for the process to complete and get the result
    const res = yield* fiber.join(fiber.spawn(f1));
    console.log('Fiber 2 recieved:', res);

    // Start f1 and make its lifetime depends on current fiber
    const childProc = fiber.spawn(f1);
    fiber.mount(childProc, proc);
  });

  console.log('Fiber 2 started:', fiber.resumed(main));

  // Pause the current fiber process
  fiber.pause(main);
  console.log('Fiber 2 is paused:', fiber.paused(main));

  // Resume the fiber
  fiber.resume(main);
  console.log('Fiber 2 is resumed:', fiber.resumed(main));

  // Wait for the fiber process to finish
  await fiber.done(main);

  // Check finish status
  console.log('Fiber 2 completed:', fiber.completed(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  console.log('Fiber 1 started:', fiber.resumed(main));

  // Stop a fiber
  fiber.interrupt(main);
  console.log('Fiber 1 interrupted:', fiber.interrupted(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  console.log('Fiber 1 started:', fiber.resumed(main));

  // Timeout a fiber
  await fiber.timeout(main, 500);
  console.log('Fiber 1 stopped:', fiber.interrupted(main));
}
