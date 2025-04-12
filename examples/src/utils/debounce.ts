import * as co from 'ciorent';

const fn = co.debounce((id: number) => {
  console.log('ID:', id);
}, 500);

fn(1); // fn(1) gets skipped
await co.sleep(100);
fn(2); // fn(2) gets executed
