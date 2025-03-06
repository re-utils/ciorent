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

  // Unblock the latch
  latch.open(fetchLatch);
}

const main = async () => {
  const p = task();
  await cio.sleep(500);
  prepare();

  return p;
}

// Run fetch after 500ms
await main();

// Re-close the latch
latch.close(fetchLatch);

// Run fetch after another 500ms
await main();
