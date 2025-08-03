import { run, bench, summary, do_not_optimize } from 'mitata';
import limitConcur from 'limit-concur';
import { limitFunction } from 'p-limit';
import { semaphore } from 'ciorent';

summary(() => {
  const CONCURRENCY = 10;
  const TASKS = 50;

  const setup = (label: string, limited: (i: number) => Promise<void>) => {
    bench(label, async () => {
      let tasks = new Array(TASKS);
      for (let i = 0; i < TASKS; i++) tasks[i] = limited(i);
      await Promise.all(tasks);
    });
  };

  const task = async (i: number) => {
    let num = i;
    for (let i = 0, s = 1e3 * (Math.random() * 4 + 10); i < s; i++) {
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
