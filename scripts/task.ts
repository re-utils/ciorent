import { SCRIPTS } from './utils.ts';

const task = process.argv[2];
if (task == null) throw new Error('A task must be specified!');

await Bun.$`bun run ${{
  raw: SCRIPTS + '/' + task + '.ts',
}} ${process.argv.slice(3)}`;
