import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  bench('Fill with null', function* () {
    const DAT = new Array(6).fill(null);

    yield {
      [0]() {
        return [...DAT];
      },
      [1]() {
        return Promise.resolve(15);
      },
      async bench(data: any[], p: any) {
        data[0] = p;
        do_not_optimize(await Promise.all(data));
      },
    };
  });

  bench('Fill with resolved promises', function* () {
    const resolvedPromise = Promise.resolve();
    const DAT = new Array(6).fill(resolvedPromise);

    yield {
      [0]() {
        return [...DAT];
      },
      [1]() {
        return Promise.resolve(15);
      },
      async bench(data: any[], p: any) {
        data[0] = p;
        do_not_optimize(await Promise.all(data));
      },
    };
  });
});

// Start the benchmark
run();
