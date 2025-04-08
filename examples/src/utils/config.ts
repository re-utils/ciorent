import config from '@/types';

export default config({
  heading: 'Utilities',
  examples: {
    pause: {
      heading: 'Pausing',
      desc: 'Delay the execution of a function for other asynchronous tasks to run.'
    },
    sleep: {
      heading: 'Sleep',
      desc: 'Cross-runtime synchronous and asynchronous sleep functions.'
    },
    spawn: {
      heading: 'Spawning tasks',
      desc: 'Utilities to create and run tasks.'
    },
    debounce: {
      heading: 'Debounce',
      desc: 'Dropping tasks for a period of time.'
    },
    throttle: {
      heading: 'Throttle',
      desc: 'Limit function calls for a specific period of time.'
    }
  },
  priority: Number.NEGATIVE_INFINITY
});
