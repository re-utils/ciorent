import { summary, run, bench, do_not_optimize, type k_state } from 'mitata';

// Example benchmark
summary(() => {
  bench('Clone 2 arrays - Concat', function*(state: k_state) {
    const DAT = new Array(state.get('len')).fill(0).map(Math.random);
    const DAT2 = new Array(state.get('len')).map(Math.random);

    yield {
      [0]() {
        return DAT;
      },
      [1]() {
        return DAT2;
      },
      bench(data: any[], data1: any[]) {
        do_not_optimize(data.concat(data1));
      }
    }
  }).range('len', 2 ** 3, 2 ** 12);

  bench('Clone 2 arrays - Spread', function*(state: k_state) {
    const DAT = new Array(state.get('len')).fill(0).map(Math.random);
    const DAT2 = new Array(state.get('len')).map(Math.random);

    yield {
      [0]() {
        return DAT;
      },
      [1]() {
        return DAT2;
      },
      bench(data: any[], data1: any[]) {
        do_not_optimize([...data, ...data1]);
      }
    }
  }).range('len', 2 ** 3, 2 ** 12);
});

summary(() => {
  bench('Clone 1 array - Concat', function*(state: k_state) {
    const DAT = new Array(state.get('len')).fill(0).map(Math.random);

    yield {
      [0]() {
        return DAT;
      },
      bench(data: any[]) {
        do_not_optimize(data.concat([]));
      }
    }
  }).range('len', 2 ** 3, 2 ** 12);

  bench('Clone 1 array - Spread', function*(state: k_state) {
    const DAT = new Array(state.get('len')).fill(0).map(Math.random);

    yield {
      [0]() {
        return DAT;
      },
      bench(data: any[]) {
        do_not_optimize([...data]);
      }
    }
  }).range('len', 2 ** 3, 2 ** 12);
});

// Start the benchmark
run();
