import * as cio from 'ciorent';

const logTime = () => console.log(Math.floor(performance.now()) + 'ms');

logTime();
await cio.sleep(500);
logTime();

// This blocks the current thread
// On the browser this only works in workers and blocks the worker thread
cio.sleepSync(500);

logTime();
