import { Glob } from 'bun';
import { BENCH, cd, exec } from './utils.js';

const exe = { raw: 'bun run' };

let exactBench = process.argv[2];
if (exactBench === '--node') {
  exe.raw = 'bun tsx --expose-gc --allow-natives-syntax';
  exactBench = process.argv[3];
}

cd(BENCH);

if (exactBench != null) {
  const path = `${exactBench}.bench.ts`;
  console.log('Running benchmark:', path);
  await exec`${exe} ${path}`;
} else
  for (const path of new Glob('**/*.bench.ts').scanSync(BENCH)) {
    console.log('Running benchmark:', path);
    await exec`${exe} ${path}`;
  }
