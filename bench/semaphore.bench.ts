import { semaphore } from 'ciorent';
import limitConcur from 'limit-concur';
import { bench, do_not_optimize, run, summary } from 'mitata';
import { limitFunction } from 'p-limit';

summary(() => {
  const CONCURRENCY = 10;
  const TASKS = 50;
  const ITER = 1e3;

  const setup = (label: string, limited: (s: number) => Promise<void>) => {
    bench(label, function* () {
      yield {
        [0]: () => ITER,
        bench: async (n: number) => {
          const tasks = new Array(TASKS);
          for (let i = 0; i < TASKS; i++) tasks[i] = limited(n);
          await Promise.all(tasks);
        },
      };
    });
  };

  const task = async (s: number) => {
    let num = 0;
    for (let i = 0; i < s; i++) {
      if (i % 10 === 0) await 0;
      num += Math.random() * s + i;
    }
    do_not_optimize(num);
  };

  setup('limit-concur', limitConcur(CONCURRENCY, task));
  setup('p-limit', limitFunction(task, { concurrency: CONCURRENCY }));
  setup('ciorent', semaphore.permits(task, CONCURRENCY));
});

run();
