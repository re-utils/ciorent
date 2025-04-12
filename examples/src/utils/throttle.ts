import * as co from 'ciorent';

// Allow 2 calls in 500ms
const fn = co.throttle((id: number) => {
  console.log(id + ': ' + Math.floor(performance.now()) + 'ms');
}, 500, 2);

co.spawn(8, fn);
