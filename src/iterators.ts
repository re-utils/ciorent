import { loadedResolve, loadResolve } from './utils.ts';

// Iterator utils
const iteratorDoneResult = {
  done: true,
  value: undefined,
};
const promiseIteratorDoneResult = Promise.resolve(iteratorDoneResult);
const toIteratorResult = <T>(value: T): IteratorResult<T> => ({
  done: false,
  value,
});
const resolveNext = async (
  p: Promise<any>,
  resolvers: ((value: any) => void)[],
) => {
  try {
    // Fast path: only unwrap promise once
    const res = await p;
    resolvers.pop()!(res);
  } catch {
    resolvers.pop()!(p);
  }
};

/**
 * Describe an async iterator created by `race()`
 */
export interface RaceIterator<T> extends AsyncIterator<T> {
  _: Promise<T>[];
}

function raceNext(this: RaceIterator<any>): any {
  return this._.pop()?.then(toIteratorResult) ?? promiseIteratorDoneResult;
}

/**
 * Race promises and return them in order
 */
export const race = <T>(promises: Promise<T>[]): RaceIterator<T> => {
  const last = promises.length - 1;
  const waitingPromises = new Array<Promise<T>>(last + 1);

  for (
    let i = 0, resolvers = new Array<(value: any) => void>(last + 1);
    i <= last;
    i++
  ) {
    waitingPromises[last - i] = new Promise(loadResolve);
    resolvers[last - i] = loadedResolve;
    resolveNext(promises[i], resolvers);
  }

  return {
    next: raceNext,
    _: waitingPromises,
  };
};

/**
 * Describe an async iterator created by `map()`
 */
export interface MapIterator<I, O> extends AsyncIterator<O> {
  _: AsyncIterator<I>;
  f: (value: I) => Promise<Awaited<O>>;
}

async function mapNext(this: MapIterator<any, any>): Promise<any> {
  const p = await this._.next();
  if (p.done) return iteratorDoneResult;

  const res = this.f(p.value);
  return toIteratorResult(res instanceof Promise ? await res : res);
}

export const map = <I, O>(
  iterator: AsyncIterator<I>,
  mapFn: MapIterator<I, O>['f'],
): MapIterator<I, O> => ({
  next: mapNext,
  _: iterator,
  f: mapFn,
});

/**
 * Describe an async iterator created by `filter()`
 */
export interface FilterIterator<T> extends AsyncIterator<T> {
  _: AsyncIterator<T>;
  f: (value: T) => Promise<boolean> | boolean;
}

async function filterNext(this: FilterIterator<any>): Promise<any> {
  let p = await this._.next();
  while (!p.done) {
    const res = this.f(p.value);
    if (res instanceof Promise ? await res : res) return p;
    p = await this._.next();
  }

  return iteratorDoneResult;
}

export const filter = <T>(
  iterator: AsyncIterator<T>,
  filterFn: FilterIterator<T>['f'],
): FilterIterator<T> => ({
  next: filterNext,
  _: iterator,
  f: filterFn,
});

export const find = async <T>(
  iterator: AsyncIterator<T>,
  findFn: (value: T) => Promise<boolean> | boolean,
): Promise<T | undefined> => {
  let p = await iterator.next();
  while (!p.done) {
    const res = findFn(p.value);
    if (res instanceof Promise ? await res : res) return p.value;
    p = await iterator.next();
  }
};
