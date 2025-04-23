/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { transform } from 'oxc-transform';

import pkg from '../package.json';
import { cp, LIB, ROOT, SOURCE } from './utils.js';
import { minify } from 'oxc-minify';

// Remove old content
if (existsSync(LIB)) rmSync(LIB, { recursive: true });

// @ts-ignore
const exports = (pkg.exports = {} as Record<string, string>);

Array.fromAsync(new Bun.Glob('**/*.ts').scan(SOURCE))
  .then((paths) =>
    Promise.all(
      paths.map(async (path) => {
        const pathNoExt = path.substring(0, path.lastIndexOf('.') >>> 0);

        const transformed = transform(
          path,
          await Bun.file(`${SOURCE}/${path}`).text(),
          {
            sourceType: 'module',
            typescript: {
              declaration: {
                stripInternal: true,
              },
            },
            lang: 'ts',
          },
        );

        Bun.write(`${LIB}/${pathNoExt}.d.ts`, transformed.declaration);
        if (transformed.code !== '')
          Bun.write(
            `${LIB}/${pathNoExt}.js`,
            minify(path, transformed.code.replace(/const /g, 'let '), {
              compress: false,
            }).code,
          );

        exports[
          pathNoExt === 'index'
            ? '.'
            : './' +
              (pathNoExt.endsWith('/index')
                ? pathNoExt.slice(0, -6)
                : pathNoExt)
        ] = './' + pathNoExt + (transformed.code === '' ? '.d.ts' : '.js');
      }),
    ),
  )
  .then(() => {
    delete pkg.trustedDependencies;
    delete pkg.devDependencies;
    delete pkg.scripts;

    Bun.write(LIB + '/package.json', JSON.stringify(pkg));
    cp(ROOT, LIB, 'README.md');
  });
