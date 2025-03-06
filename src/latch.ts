/**
 * @module
 * Latches
 */

import { pause as endPromise } from '.';

/**
 * Describe a latch
 */
export type Latch = [
  pause: Promise<void>,
  open: () => void
];

/**
 * Create a latch
 */
export const init = (): Latch => {
  let r;
  return [new Promise<void>((res) => { r = res; }), r!];
};

/**
 * Pause until a latch is opened
 */
export const pause = (latch: Latch): Promise<void> => latch[0];

/**
 * Open a latch
 */
export const open = (latch: Latch): void => {
  latch[1]();
  latch[0] = endPromise;
};

/**
 * Close a latch
 */
export const close = (latch: Latch): void => {
  if (latch[0] === endPromise) {
    let r;
    latch[0] = new Promise<void>((res) => { r = res; });
    latch[1] = r!;
  }
};
