/**
 * @module Concurrency controls
 */

/**
 * Describe an async task
 */
export type Task<T = unknown> = () => Promise<T>;

/**
 * Describe a concurrency controller
 */
export type Controller = <T>(task: Task<T>) => Promise<T>;
