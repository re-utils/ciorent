/**
 * Describe a rate limiter
 */
export type Limiter = (limit: number, ms: number) => () => boolean;

/**
 * Fixed window strategy
 * @param limit
 * @param ms
 */
export const fixedWindow: Limiter = (limit, ms) => {
  let cur = limit;
  const unlock = () => {
    cur = limit;
  };

  return () => {
    if (cur === 0) return false;
    if (cur-- === limit) setTimeout(unlock, ms);

    return true;
  };
};

/**
 * Sliding window strategy
 * @param limit
 * @param ms
 */
export const slidingWindow: Limiter = (limit, ms) => {
  let cur = limit;
  const unlock = () => {
    cur++;
  };

  return () => {
    if (cur === 0) return false;

    cur--;
    setTimeout(unlock, ms);
    return true;
  };
};

/**
 * Token bucket strategy
 * @param limit
 * @param ms
 */
export const tokenBucket: Limiter = (limit, ms) => {
  let cur = limit;

  ms /= limit;
  const unlock = () => {
    if (cur++ < limit) setTimeout(unlock, ms);
  };

  return () => {
    if (cur === 0) return false;
    if (cur-- === limit) setTimeout(unlock, ms);

    return true;
  };
};
