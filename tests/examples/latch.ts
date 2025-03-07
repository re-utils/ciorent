import * as latch from 'ciorent/latch';
import * as cio from 'ciorent';

const fetchLatch = latch.init();

const task = async () => {
  // Blocks until the latch is open
  await latch.pause(fetchLatch);

  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  console.log('Run before fetch:', performance.now().toFixed(2));
}

const main = async () => {
  const p = task();
  await cio.sleep(500);
  prepare();

  // Allows all previously blocked tasks to run
  latch.open(fetchLatch);

  // Reclose the latch
  // Tasks that aren't blocked yet will be blocked
  latch.reset(fetchLatch);

  return p;
}

// Run fetch after 500ms
await main();

// Run fetch after another 500ms
await main();
