/**
 * @module Rate limit
 */

 /**
  * Describe a rate limiter
  */
export type Limiter = (calls: number, ms: number) => () => boolean;

/**
 * Fixed window strategy
 * @param limit
 * @param ms
 */
export const fixed: Limiter = (limit, ms) => {
  let cur = limit;
  const unlock = () => {
    cur = limit;
  }

  return () => {
    if (cur === 0) return false;

    if (cur === limit)
      setTimeout(unlock, ms);
    cur--;
    return true;
  }
}

/**
 * Sliding window strategy
 * @param limit
 * @param ms
 */
export const sliding: Limiter = (limit, ms) => {
  let cur = limit;
  const unlock = () => {
    cur++;
  }

  return () => {
    if (cur === 0) return false;

    cur--;
    setTimeout(unlock, ms);
    return true;
  }
}

/**
 * Token bucket strategy
 * @param limit
 * @param ms
 */
export const bucket: Limiter = (limit, ms) => {
  let cur = limit;

  ms /= limit;
  const unlock = () => {
    cur++;
    if (cur < limit)
      setTimeout(unlock, ms);
  }

  return () => {
    if (cur === 0) return false;

    if (cur === limit)
      setTimeout(unlock, ms);

    cur--;
    return true;
  }
}
