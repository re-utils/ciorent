import { semaphore, mutex } from 'ciorent';
import limitConcur from 'limit-concur';
import { limitFunction } from 'p-limit';
import { Mutex, Semaphore } from 'async-mutex';
import mutexify from 'mutexify/promise.js';

import { bench, do_not_optimize, run, summary } from 'mitata';
import { Sema } from 'async-sema';

const task = async () => {
  await 0;
  do_not_optimize(Math.random());
};

const setup = (label: string, limited: () => Promise<any>) => {
  bench(label, Function('f', `return async () => { await Promise.all([${
    'f(),'.repeat(200)
  }]); }`)(limited)).gc('inner');
};

const setupSemaphoreCases = (permit: number) => {
  setup(`permit ${permit} - limit-concur`, limitConcur(permit, task));
  setup(`permit ${permit} - p-limit`, limitFunction(task, { concurrency: permit }));

  {
    const sem = semaphore.init(permit, 200 - permit);
    setup(`permit ${permit} - ciorent (semaphore)`, async () => {
      await semaphore.acquire(sem);
      await task();
      semaphore.release(sem);
    });
  }

  {
    const sem = new Semaphore(permit);
    setup(`permit ${permit} - async-mutex (semaphore)`, () => sem.runExclusive(task));
  }

  {
    const sem = new Sema(permit);
    setup(`permit ${permit} - async-sema`, async () => {
      await sem.acquire();
      try {
        return await task();
      } finally {
        sem.release();
      }
    });
  }

  {
    const sem = new Sema(permit, {
      capacity: 200 - permit
    });
    setup(`permit ${permit} - async-sema (pre-allocated)`, async () => {
      await sem.acquire();
      try {
        return await task();
      } finally {
        sem.release();
      }
    });
  }
}

summary(() => {
  setupSemaphoreCases(1);

  {
    const mu = mutex.init();
    setup('permit 1 - ciorent (mutex)', () => mutex.run(mu, task));
  }

  {
    const mu = new Mutex();
    setup('permit 1 - async-mutex (mutex)', () => mu.runExclusive(task));
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

for (let permit = 2; permit < 128; permit <<= 1)
  summary(() => {
    setupSemaphoreCases(permit);
  });

run();
