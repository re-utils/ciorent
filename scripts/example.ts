import { EXAMPLES } from './utils';

const task = process.argv[2];
if (task == null) throw new Error('An example must be specified!');

const path = EXAMPLES + '/' + task + '.ts';
console.log('Running', path.replace(process.cwd(), '.'));

await Bun.$`bun ${{ raw: path }}`;
