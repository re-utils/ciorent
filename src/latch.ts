/**
 * @module Latches
 */

import { init as deferInit, wait as deferWait, type Defer } from './defer.js';

/**
 * Describe a latch
 */
export type Latch = Defer<void>;

/**
 * Create a latch
 */
export const init: () => Latch = deferInit;

/**
 * Wait until a latch is opened
 */
export const wait: (d: Latch) => Promise<void> = deferWait;

/**
 * Open a latch
 */
export const open = (latch: Latch): void => {
  latch[1]();
};
