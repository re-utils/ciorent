import { cd, exec, LIB } from './utils.js';

cd(LIB);
await exec`bun publish --access=public`;
