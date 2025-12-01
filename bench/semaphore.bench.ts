import { semaphore, mutex } from 'ciorent';
import limitConcur from 'limit-concur';
import { bench, do_not_optimize, run, summary } from 'mitata';
import { limitFunction } from 'p-limit';

const task = async (s: number) => {
  await 0;
  let num = 0;
  for (let i = 0; i < s; i++)
    num += Math.random() * s + i;
  do_not_optimize(num);
};

const setup = (label: string, limited: (s: number) => Promise<void>) => {
  bench(label, function* () {
    yield {
      bench: async () => {
        await Promise.all([
          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),

          limited(1e2),
          limited(2e2),
        ]);
      },
    };
  }).gc('inner');
};

summary(() => {
  setup('mutex - limit-concur', limitConcur(1, task));
  setup('mutex - p-limit', limitFunction(task, { concurrency: 1 }));
  setup('mutex - ciorent semaphore', semaphore.permits(task, 1));

  const mu = mutex.init();
  setup('mutex - ciorent mutex', async (s) => {
    const release = await mutex.acquire(mu);
    await task(s);
    release();
  });
});

run();
