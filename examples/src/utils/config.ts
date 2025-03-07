import config from "@/types";

export default config({
  heading: 'Utilities',
  examples: {
    pause: {
      heading: 'Pausing',
      desc: 'Delay the execution of a function for other asynchronous tasks to run.'
    },
    sleep: {
      heading: 'Sleep',
      desc: 'A cross-runtime sleep function.'
    },
    concurrent: {
      heading: 'Basic concurrency',
      desc: 'Control how many tasks can be executed concurrently.'
    },
    spawn: {
      heading: 'Spawning tasks',
      desc: 'Creating new tasks with controlled concurrency.'
    }
  },
  priority: -Infinity
})
