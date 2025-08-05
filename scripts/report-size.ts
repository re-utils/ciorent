import { minify } from 'oxc-minify';
import { LIB } from './utils.ts';

const toByte = (num: number) =>
  num >= 1e3 ? (num / 1e3).toFixed(2) + 'KB' : num + 'B';

const arr = await Promise.all(
  [...new Bun.Glob('**/*.js').scanSync(LIB)].map(async (path) => {
    const file = Bun.file(LIB + '/' + path);
    const code = await file.text();
    const minfiedCode = minify(path, code).code!;

    return {
      entry: path,
      size: file.size,
      minified: Buffer.from(minfiedCode).byteLength,
      gzip: Bun.gzipSync(code).byteLength,
      minifiedGzip: Bun.gzipSync(minfiedCode).byteLength,
    };
  }),
);

console.table(
  arr
    .sort((a, b) => a.size - b.size)
    .map((val) => ({
      Entry: val.entry,
      Size: toByte(val.size),
      Minify: toByte(val.minified),
      GZIP: toByte(val.gzip),
      'Minify GZIP': toByte(val.minifiedGzip),
    })),
);
