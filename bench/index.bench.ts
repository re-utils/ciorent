import { summary, run, bench } from 'mitata';

// Example benchmark
summary(() => {
  bench('Date.now()', () => Date.now());
  bench('performance.now()', () => performance.now());
});

// Start the benchmark
run();
