import { cd, exec, LIB } from './utils.ts';

cd(LIB);
await exec`bun publish --access=public`;
