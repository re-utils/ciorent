import { existsSync } from 'node:fs';
import { cd, EXAMPLES } from './utils';

let task = process.argv[2];
if (task == null) throw new Error('An example must be specified!');

if (!existsSync(task + '.ts')) {
  task += '/index';
  if (!existsSync(task + '.ts'))
    throw new Error('Cannot find specified example to run!');
}
console.log('Running', task);

cd(EXAMPLES);
await Bun.$`${{ raw: process.argv[3] === '--node' ? 'bun tsx' : 'bun' }} ${{ raw: './' + task + '.ts' }}`;
