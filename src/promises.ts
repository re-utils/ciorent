import { loadedResolve, loadResolve } from './utils.js';

/**
 * Async `Array.prototype.map`. **Mutates** the original array.
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
  fn: (value: T) => R | Promise<R>,
): Promise<R>[] => {
  for (let i = 0; i < arr.length; i++) arr[i] = arr[i].then(fn) as any;
  return arr as any;
};

type FindState = [remaining: number, resolve: (value?: any) => void];
const resolveFind = async (
  fn: (value: any) => boolean | Promise<boolean>,
  promise: Promise<any>,
  state: FindState,
) => {
  try {
    const result = await promise;
    const findResult = fn(result);
    if (findResult instanceof Promise ? await findResult : findResult)
      return state[1](result);

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
  fn: (value: T) => boolean | Promise<boolean>,
): Promise<T | undefined> => {
  const promise = new Promise(loadResolve);
  for (
    let i = 0, state: FindState = [arr.length, loadedResolve];
    i < arr.length;
    i++
  )
    resolveFind(fn, arr[i], state);
  return promise;
};

const resolveSome = async (
  fn: (value: any) => boolean | Promise<boolean>,
  promise: Promise<any>,
  state: FindState,
) => {
  try {
    const result = fn(await promise);
    if (typeof result === 'boolean' ? result : await result)
      return state[1](true);

    if (--state[0] === 0) state[1](false);
  } catch {
    if (--state[0] === 0) state[1](false);
    return promise;
  }
};

/**
 * Async `Array.prototype.some`.
 */
export const some = <T>(
  arr: Promise<T>[],
  fn: (value: T) => boolean | Promise<boolean>,
): Promise<boolean> => {
  const promise = new Promise(loadResolve);
  for (
    let i = 0, state: FindState = [arr.length, loadedResolve];
    i < arr.length;
    i++
  )
    resolveSome(fn, arr[i], state);
  return promise;
};

const resolveEvery = async (
  fn: (value: any) => boolean | Promise<boolean>,
  promise: Promise<any>,
  state: FindState,
) => {
  try {
    const result = fn(await promise);
    if (typeof result === 'boolean' ? !result : !(await result))
      return state[1](false);

    if (--state[0] === 0) state[1](true);
  } catch {
    if (--state[0] === 0) state[1](true);
    return promise;
  }
};

/**
 * Async `Array.prototype.every`.
 */
export const every = <T>(
  arr: Promise<T>[],
  fn: (value: T) => boolean | Promise<boolean>,
): Promise<boolean> => {
  const promise = new Promise(loadResolve);
  for (
    let i = 0, state: FindState = [arr.length, loadedResolve];
    i < arr.length;
    i++
  )
    resolveEvery(fn, arr[i], state);
  return promise;
};
