import * as co from 'ciorent';

const logTime = (label: string) => console.log(`${label}: ${Math.floor(performance.now())}ms`);;

logTime('Start');

// Non-blocking
await co.sleep(500);
logTime('After about 0.5s');

// This blocks the event loop
// On the browser this only works in workers and blocks the worker thread
co.sleepSync(500);
logTime('After another 0.5s');
