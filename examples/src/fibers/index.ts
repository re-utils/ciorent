import * as cio from 'ciorent';
import * as fiber from 'ciorent/fiber';

const f1 = fiber.fn(function* () {
  console.log('Fiber 1 started');

  // Wait for a promise
  yield cio.sleep(1000);

  console.log('Fiber 1 done');
  return Math.random();
});

fiber.spawn(function* (proc) {
  console.log('Fiber 2 started');

  // Start f1, wait for it to finish and get the result
  const res = yield* fiber.join(fiber.spawn(f1));
  console.log('Fiber 1 result:', res);

  // Start f1 and make its lifetime depends on current fiber
  fiber.mount(fiber.spawn(f1), proc);

  // The runtime will interrupt f1
  console.log('Fiber 2 done');
});
