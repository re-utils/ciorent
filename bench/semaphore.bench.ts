import { semaphore, mutex } from 'ciorent';
import limitConcur from 'limit-concur';
import { limitFunction } from 'p-limit';
import { Mutex, Semaphore } from 'async-mutex';
import mutexify from 'mutexify/promise.js';

import { bench, do_not_optimize, run, summary } from 'mitata';

const task = async () => {
  await 0;
  do_not_optimize(Math.random());
  await 0;
  do_not_optimize(Math.random());
};

const setup = (label: string, limited: () => Promise<void>) => {
  bench(label, Function('f', `return async () => { await Promise.all([${
    'f(),'.repeat(200)
  }]); }`)(limited)).gc('inner');
};

const setupCases = (permit: number) => {
  setup(`permit ${permit} - limit-concur`, limitConcur(permit, task));
  setup(`permit ${permit} - p-limit`, limitFunction(task, { concurrency: permit }));
  setup(`permit ${permit} - ciorent (semaphore)`, semaphore.permits(task, permit));

  {
    const sem = new Semaphore(permit);
    setup(`permit ${permit} - async-mutex`, () => sem.runExclusive(task));
  }
}

summary(() => {
  setupCases(1);
  setup('permit 1 - ciorent (mutex)', mutex.permits(task));

  {
    const mu = new Mutex();
    setup('permit 1 - async-mutex', () => mu.runExclusive(task));
  }

  {
    const acquire = mutexify();
    setup('permit 1 - mutexify', async () => {
      const release = await acquire();
      try {
        return await task();
      } finally {
        release();
      }
    })
  }
});

for (const permit of [3, 5, 15, 50])
  summary(() => {
    setupCases(permit);
  });

run();
