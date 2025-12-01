import type { Extend } from './types.ts';

/**
 * Describe a mutex
 */
export type Mutex = [
  /**
   * Current lock promise
   */
  lock: Promise<void> | null,
  /**
   * Cached promise executor callback
   */
  executor: (res: () => void) => void,
  /**
   * Current resolve function
   */
  resolve: () => void,
];

/**
 * Create a mutex.
 */
export const init = (): Mutex => {
  const o: Mutex = [
    null!,
    (res) => {
      o[2] = res;
    },
    null!,
  ];
  return o;
};

/**
 * Acquire a mutex.
 * @returns a release callback
 */
export const acquire = async (mutex: Extend<Mutex>): Promise<Mutex[2]> => {
  const currentLock = mutex[0];
  mutex[0] = new Promise(mutex[1]);

  const release = mutex[2];
  await currentLock;
  return release;
};
