import latch from 'ciorent/latch';

const [startFetch, pauseFetch] = latch();

const task = async () => {
  // Blocks until the latch is open
  await pauseFetch;

  const res = await fetch('http://example.com');
  console.log('Fetch status:', res.status);
}

const prepare = () => {
  console.log('Run before fetch');

  // Unblock the latch
  startFetch();
}

task();
setTimeout(prepare, 500);
