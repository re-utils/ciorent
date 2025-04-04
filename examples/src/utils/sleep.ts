import { sleep, sleepSync } from 'ciorent';

await sleep(500);
console.log('Hi');

// This blocks the current thread
// On the browser this only works in workers
sleepSync(500);
console.log('Hi');
