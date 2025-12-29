/**
 * Continue the execution on next event loop cycle.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 * blocking the main thread and let other asynchronous task to run.
 */
export const nextTick: Promise<void> = Promise.resolve();

export * as mutex from './mutex.js';
export * as limit from './rate-limit.js';
export * as semaphore from './semaphore.js';
export * as signal from './signal.js';
export * as promises from './promises.js';
