import * as cio from 'ciorent';

const fn = cio.rateLimit((id: number) => {
  console.log('ID:', id);
}, 500, 1);

fn(1); // fn(1) gets executed
await cio.sleep(100);
fn(2); // fn(2) gets skipped
await cio.sleep(500);
fn(3); // fn(3) gets executed
