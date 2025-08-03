import { run, bench, summary, do_not_optimize } from 'mitata';
import limitConcur from 'limit-concur';
import { limitFunction } from 'p-limit';
import { semaphore } from 'ciorent';

summary(() => {
  const CONCURRENCY = 10;
  const TASKS = 50;
  const ITER = 1e4;

  const setup = (label: string, limited: (s: number) => Promise<void>) => {
    bench(label, function* () {
      yield {
        [0]: () => ITER,
        bench: async (n: number) => {
          let tasks = new Array(TASKS);
          for (let i = 0; i < TASKS; i++) tasks[i] = limited(n);
          await Promise.all(tasks);
        }
      }
    });
  };

  const task = async (s: number) => {
    let num = 0;
    for (let i = 0; i < s; i++) {
      if (i % 100 === 0) await 0;
      num += Math.random() * s + i;
    }
    do_not_optimize(num);
  };

  setup('limit-concur', limitConcur(CONCURRENCY, task));
  setup('p-limit', limitFunction(task, { concurrency: CONCURRENCY }));
  setup('ciorent', semaphore.permits(task, CONCURRENCY));
});

run();
