import { parseArgs } from 'node:util';
import { Glob } from 'bun';
import { BENCH, cd, exec } from './utils.ts';

const CMD: Dict<string> = {
  bun: 'bun run',
  node: 'node --import jiti/register --expose-gc --allow-natives-syntax',
  deno: 'deno run --allow-all --v8-flags=--expose-gc,--allow-natives-syntax',
};

const args = parseArgs({
  options: {
    runtime: {
      type: 'string',
      default: 'node',
      short: 'r',
    },
    target: {
      type: 'string',
      short: 't',
    },
  },
}).values;

const EXE = CMD[args.runtime];
if (EXE == null) throw new Error('Unrecognized runtime: ' + args.runtime);

cd(BENCH);

if (args.target != null) {
  const path = `${args.target}.bench.ts`;
  console.log('Running benchmark:', path);
  await exec`${{ raw: EXE }} ${path}`;
} else
  for (const path of new Glob('**/*.bench.ts').scanSync(BENCH)) {
    console.log('Running benchmark:', path);
    await exec`${{ raw: EXE }} ${path}`;
  }
