import * as cio from 'ciorent';

await cio.sleep(500);
console.log('Hi');

// This blocks the current thread
// On the browser this only works in workers
cio.sleepSync(500);
console.log('Hi');
