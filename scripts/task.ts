import { SCRIPTS } from './utils.js';

const task = process.argv[2];
if (task == null) throw new Error('A task must be specified!');

await Bun.$`bun ${{
  raw: SCRIPTS + '/' + task + '.ts',
}} ${process.argv.slice(3)}`;
