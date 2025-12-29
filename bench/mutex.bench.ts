import { run, bench, summary, do_not_optimize } from 'mitata';
import { mutex } from 'ciorent';

summary(() => {
  const fn = async (num: number) => {
    do_not_optimize(num);
    await 0;
    return num;
  }

  bench('finally with callback', function* () {
    let lock = Promise.resolve();
    const run = (fn: any, ...args: any[]) => lock = lock.finally(() => fn(...args));

    yield {
      [0]: Math.random,
      bench: (num: number) => run(fn, num)
    };
  }).gc('inner');

  bench('finally without callback', function* () {
    let lock = Promise.resolve();
    const runWithLock = async (lock: any, fn: any, ...args: any[]) => {
      try {
        await lock;
      } finally {
        return fn(...args);
      }
    }
    const run = (fn: any, ...args: any[]) => lock = runWithLock(lock, fn, ...args);

    yield {
      [0]: Math.random,
      bench: (num: number) => run(fn, num)
    };
  }).gc('inner');

  bench('ciorent mutex', function* () {
    const mu = mutex.init();

    yield {
      [0]: Math.random,
      bench: (num: number) => mutex.run(mu, fn, num)
    };
  }).gc('inner');
});

run();
