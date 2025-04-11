import * as cio from 'ciorent';

// Allow 2 calls in 500ms
const fn = cio.throttle((id: number) => {
  console.log(id + ': ' + Math.floor(performance.now()) + 'ms');
}, 500, 2);

cio.concurrent(8, fn);
