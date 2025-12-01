import { semaphore, mutex } from 'ciorent';
import limitConcur from 'limit-concur';
import { bench, do_not_optimize, run, summary } from 'mitata';
import { limitFunction } from 'p-limit';

const task = async () => {
  await 0;
  do_not_optimize(Math.random());
  await 0;
  do_not_optimize(Math.random());
};

const setup = (label: string, limited: () => Promise<void>) => {
  bench(label, Function('f', `return async () => { await Promise.all([${
    'f(),'.repeat(150)
  }]); }`)(limited)).gc('inner');
};

const setupCases = (permit: number) => {
  setup(`permit ${permit} - limit-concur`, limitConcur(permit, task));
  setup(`permit ${permit} - p-limit`, limitFunction(task, { concurrency: permit }));
  setup(`permit ${permit} - ciorent (semaphore)`, semaphore.permits(task, permit));
}

summary(() => {
  setupCases(1);
  setup('permit 1 - ciorent (mutex)', mutex.permits(task));
});

for (const permit of [3, 5, 15, 50])
  summary(() => {
    setupCases(permit);
  });

run();
