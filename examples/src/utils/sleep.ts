import { sleep, sleepSync } from 'ciorent';

await sleep(500);
console.log('Hi');

sleepSync(500);
console.log('Hi');
