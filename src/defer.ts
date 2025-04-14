/**
 * @module Deferred values
 */

/**
 * Describe a defer
 */
export type Defer<T = any> = [
  pause: Promise<T>,
  open: (value: T | PromiseLike<T>) => void,
];

/**
 * Create a latch
 */
export const init = <T>(): Defer<T> => {
  let r;
  return [
    new Promise<T>((res) => {
      r = res;
    }),
    r!,
  ];
};

/**
 * Pause until a deferred is resolved
 */
export const wait = <T>(d: Defer<T>): Promise<T> => d[0];

/**
 * Open a latch
 */
export const resolve = <T>(d: Defer<T>, p: T | PromiseLike<T>): void => {
  d[1](p);
};
