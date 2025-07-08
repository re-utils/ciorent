/**
 * Describe a latch
 */
export type Latch = [
  p: Promise<void> | void,
  res: () => void,
  cb: (res: () => void) => void,
];

export const init = <T>(): Latch => {
  const c: Latch = [
    ,
    ,
    (r: () => void) => {
      c[1] = r;
    },
  ] as any;
  close(c);
  return c;
};

/**
 * Reclose the latch
 * @param c
 */
export const close = (c: Latch): void => {
  if (c[0] == null)
    c[0] = new Promise(c[2]);
};

/**
 * Open the latch
 * @param c
 */
export const open = (c: Latch): void => {
  c[1]();
  c[0] = void 0;
};

/**
 * Wait for the latch to open
 * @param c
 */
export const wait = (c: Latch): Promise<void> | void => c[0];
