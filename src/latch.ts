import { pause as endPromise } from '.';

/**
 * @module
 * Latches
 */

/**
 * Describe a latch
 */
export interface Latch {
  0: Promise<void>;
  1: () => void;
}

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
