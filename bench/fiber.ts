import { signal, sleep } from 'ciorent';

const logTime = (label: string) =>
  console.log(`${label}: ${Math.floor(performance.now())}ms`);

const f1 = (async (sig: signal.Signal) => {
  // Wait for a promise
  console.log('Fiber 1 waiting: 1s');
  await sleep(1000);

  // Interruption point
  if (signal.interrupted(sig)) return;

  const res = Math.random();
  console.log('Fiber 1 result:', res);

  return res;
});

{
  console.log('------------------------');

  console.log('Fiber 1 started');
  const sig = signal.init();
  const promise = f1(sig);

  // Interrupt the signal
  signal.interrupt(sig);

  // Execution will be stopped on the last interruption point
  await promise;

  console.log('Fiber 1 interrupted');
}

{
  console.log('------------------------');

  logTime('Fiber 1 started');
  const sig = signal.init();
  const promise = f1(sig);

  // Timeout a signal after a duration
  signal.timeout(sig, 500);
  await promise;

  logTime('Fiber 1 interrupted');
}
