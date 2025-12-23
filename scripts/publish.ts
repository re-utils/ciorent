import { cd, exec, LIB } from './utils.ts';

cd(LIB);
await exec`npm publish --access=public --otp=${prompt('OTP:')}`;
