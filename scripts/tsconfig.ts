import { join, relative } from 'node:path';
import { SCRIPTS } from './utils.ts';

const paths = process.argv.slice(2);

for (const path of paths)
  Bun.write(
    join(path, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: relative(path, SCRIPTS + '/tsconfig.json'),
      },
      null,
      2,
    ),
  );
