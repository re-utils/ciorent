import { loadedResolve, loadResolve } from './utils.js';

/**
 * Async `Array.prototype.map`. Mutates the original array.
 *
 * @example
 * await Promise.all(
 *   map([task1(), task2(), task3()], (taskResult) => taskResult.debug)
 * );
 *
 * // Map without mutating the original array
 * await Promise.all(
 *   map(taskPromises.slice(), (taskResult) => taskResult.debug)
 * );
 */
export const map = <T, R>(
  arr: Promise<T>[],
  mapFn: (value: T) => R | Promise<R>,
): Promise<R>[] => {
  for (let i = 0; i < arr.length; i++) arr[i] = arr[i].then(mapFn) as any;
  return arr as any;
};

type FindState = [remaining: number, resolve: (value?: any) => void];
const resolveFind = async (
  findFn: (value: any) => boolean | Promise<boolean>,
  promise: Promise<any>,
  state: FindState,
) => {
  try {
    if (await promise.then(findFn)) return state[1](promise);

    if (--state[0] === 0) state[1]();
  } catch {
    if (--state[0] === 0) state[1]();
    return promise;
  }
};
/**
 * Async `Array.prototype.find`.
 */
export const find = <T>(
  arr: Promise<T>[],
  findFn: (value: T) => boolean | Promise<boolean>,
): Promise<T | undefined> => {
  const promise = new Promise(loadResolve);
  for (
    let i = 0, state: FindState = [arr.length, loadedResolve];
    i < arr.length;
    i++
  )
    resolveFind(findFn, arr[i], state);
  return promise;
};
