import * as latch from 'ciorent/latch';

const startFetch = latch.init();

const task = async () => {
  // Blocks until the latch is open
  await latch.pause(startFetch);

  console.log('Start fetching...');
  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  // This always run first
  console.log('Run before fetch:', performance.now().toFixed(2));
  latch.open(startFetch);
}

task();
prepare();
