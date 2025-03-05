import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const DAT = Promise.resolve(1);

  bench('Await', function*() {
    yield {
      [0]() {
        return DAT;
      },
      async bench(data: any) {
        do_not_optimize(await data);
      }
    }
  });

  bench('Conditional await', function*() {
    yield {
      [0]() {
        return DAT;
      },
      async bench(data: any) {
        do_not_optimize(data instanceof Promise ? await data : data);
      }
    }
  });
});

// Start the benchmark
run();
