import config from '@/types';

export default config({
  heading: 'Utilities',
  examples: {
    spawn: {
      heading: 'Spawning tasks',
      desc: 'Utilities to create and run tasks.',
    },
    sleep: {
      heading: 'Sleep',
      desc: 'Cross-runtime synchronous and asynchronous sleep functions.',
    },
    debounce: {
      heading: 'Debounce',
      desc: 'Postpones execution until after an idle period.',
    },
    throttle: {
      heading: 'Throttle',
      desc: 'Executes a function at a regular interval.',
    },
    nextTick: {
      heading: 'Yield',
      desc: 'Continue the execution on next tick, allowing other asynchronous tasks to run.',
    },
  },
  priority: Number.POSITIVE_INFINITY,
});
