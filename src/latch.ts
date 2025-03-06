/**
 * @module
 * Latches
 */

/**
 * Create a latch
 */
export default (): [
  resolve: () => void,
  promise: Promise<void>
] => {
  let r;
  const p = new Promise<void>((res) => { r = res; });
  return [r!, p];
};
