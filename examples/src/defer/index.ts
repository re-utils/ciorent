import * as defer from 'ciorent/defer';

const logTime = (label: string) => console.log(`${label}: ${Math.floor(performance.now())}ms`);

const deferredUrl = defer.init<string>();

const task = async () => {
  // Blocks until the defer is resolved
  const url = await defer.wait(deferredUrl);

  logTime('Start fetching');
  await fetch(url).catch(() => {});
  logTime('Done fetching');
}

const prepare = () => {
  // This always run first as task is waiting
  logTime('Run before fetch');
  defer.resolve(deferredUrl, 'http://localhost:3000');
}

task();
prepare();
