import config from '@/types';

export default config({
  heading: 'Utilities',
  examples: {
    spawn: {
      heading: 'Spawning tasks',
      desc: 'Utilities to create and run tasks.'
    },
    sleep: {
      heading: 'Sleep',
      desc: 'Cross-runtime synchronous and asynchronous sleep functions.'
    },
    debounce: {
      heading: 'Debounce',
      desc: 'Postpones execution until after an idle period.',
    },
    throttle: {
      heading: 'Throttle',
      desc: 'Executes a function at a regular interval.',
    },
    pause: {
      heading: 'Pausing',
      desc: 'Delay the execution of a function for other asynchronous tasks to run.'
    }
  },
  priority: Number.POSITIVE_INFINITY
});
