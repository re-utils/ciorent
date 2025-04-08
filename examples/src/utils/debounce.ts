import * as cio from 'ciorent';

const fn = cio.debounce((id: number) => {
  console.log('ID:', id);
}, 500);

fn(1); // fn(1) gets skipped
await cio.sleep(100);
fn(2); // fn(2) gets executed
