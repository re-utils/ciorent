import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  bench('Await', function* () {
    yield {
      [0]() {
        return Promise.resolve(1);
      },
      async bench(data: any) {
        do_not_optimize(await data);
      },
    };
  });

  bench('Await non-promise', function* () {
    yield {
      [0]() {
        return 1;
      },
      async bench(data: any) {
        do_not_optimize(await data);
      },
    };
  });
});

// Start the benchmark
run();
