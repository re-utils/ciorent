import { join } from 'node:path';
import { write, file, $, type ShellOutput } from 'bun';

export const ROOT: string = join(import.meta.dir, '..');
export const LIB: string = ROOT + '/lib';
export const EXAMPLES: string = ROOT + '/examples/src';

export const cpToLib = async (path: string): Promise<number> => write(join(LIB, path), file(path));
export const exec: (...args: Parameters<typeof $>) => Promise<any> = async (...args) => $(...args).catch((err: ShellOutput) => process.stderr.write(err.stderr as any));
