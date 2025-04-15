/**
 * @module Deferred values
 */

/**
 * Describe a defer
 */
export type Defer<T = any> = [
  wait: Promise<T>,
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
 * Wait until a deferred is resolved
 */
export const wait = <T>(d: Defer<T>): Promise<T> => d[0];

/**
 * Resolve the defer
 */
export const resolve: (<T extends {}>(
  d: Defer<T>,
  p: T | PromiseLike<T>,
) => void) &
  ((d: Defer<void>) => void) = ((d: Defer, p: any): void => {
  d[1](p);
}) as any;
