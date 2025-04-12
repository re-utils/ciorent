import * as co from 'ciorent';

// Allow 2 calls in 500ms, other calls are dropped
const fn = co.rateLimit((id: number) => {
  console.log('Call ' + id + ':', Math.floor(performance.now()) + 'ms');
}, 500, 2);

// Some calls will be dropped
for (let i = 0; i < 8; i++) {
  fn(i);
  await co.sleep(400);
}
