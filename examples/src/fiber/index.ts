import * as co from 'ciorent';
import * as fiber from 'ciorent/fiber';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

const f1 = fiber.fn(function* () {
  // Wait for a promise
  console.log('Fiber 1 waiting: 1s');
  yield co.sleep(1000);

  // Wait for a promise and return its result
  const res = yield* fiber.unwrap(Promise.resolve(1));
  console.log('Fiber 1 recieved:', res);

  return Math.random();
});

{
  // Start the fiber process on next event loop cycle
  const main = fiber.spawn(function* (proc) {
    // Start f1, wait for the process to complete and get the result
    console.log('Fiber 2: joins fiber 1');
    const res = yield* fiber.join(fiber.spawn(f1));
    console.log('Fiber 2 recieved:', res);

    // Start f1 and make its lifetime depends on current fiber
    console.log('Fiber 2: spawns fiber 1');
    const childProc = fiber.spawn(f1);
    fiber.mount(childProc, proc);
  });

  console.log('Fiber 2 started:', fiber.running(main));

  // Wait for the fiber process to finish
  await fiber.complete(main);

  // Check finish status
  console.log('Fiber 2 completed:', fiber.completed(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  console.log('Fiber 1 started:', fiber.running(main));

  // Interrupt a fiber
  fiber.interrupt(main);

  // Execution will be stopped on the last yield
  await fiber.complete(main);

  console.log('Fiber 1 interrupted:', fiber.interrupted(main));
}

{
  console.log('------------------------');

  const main = fiber.spawn(f1);
  logTime('Fiber 1 started');

  // Wait for a time period then interrupt the fiber
  fiber.timeout(main, 500);
  await fiber.complete(main);

  logTime('Fiber 1 interrupted');
}
