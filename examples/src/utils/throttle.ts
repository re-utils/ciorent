import * as co from 'ciorent';

// Allow 2 calls in 500ms
const throttle = co.throttle(500, 2);

co.spawn(8, async (id) => {
  await throttle();
  console.log(id + ': ' + Math.floor(performance.now()) + 'ms');
});
