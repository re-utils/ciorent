/**
 * @module
 * Concurrency controls
 */

/**
 * Describe a concurrency controller
 */
export type Controller = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Create a concurrency controller, allow n tasks to run concurrently
 * @param n
 */
export default (n: number): Controller => {
  const pending = new Array<Promise<any>>(n);
  let cnt = 0;

  return (async (f: () => Promise<any>) => {
    if (cnt < n)
      // eslint-disable-next-line
      return pending[cnt++] = f();

    // Wait for all previous task to complete
    // This ignores unhandled error promise
    await Promise.allSettled(pending);
    cnt = 0;
    // eslint-disable-next-line
    return pending[0] = f();
  }) as any;
};
