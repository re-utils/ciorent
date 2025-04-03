import { existsSync, rmSync } from 'node:fs';

import { transpileDeclaration } from 'typescript';
import tsconfig from '../tsconfig.json';
import pkg from '../package.json';
import { cp, EXAMPLES, LIB, ROOT, SOURCE } from './utils.js';
import { readFile } from 'node:fs/promises';

// Remove old content
if (existsSync(LIB))
  rmSync(LIB, { recursive: true });

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'node',

  // Lighter output
  minifyWhitespace: true,
  treeShaking: true,
  trimUnusedImports: true
});

// @ts-ignore
const exports = pkg.exports = {} as Record<string, string>;

(async () => {
  const promises: Promise<any>[] = [];

  for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCE)) {
    promises.push(
      (async () => {
        const pathNoExt = path.substring(0, path.lastIndexOf('.') >>> 0);

        const buf = await Bun.file(`${SOURCE}/${path}`).text();
        Bun.write(`${LIB}/${pathNoExt}.d.ts`, transpileDeclaration(buf, tsconfig as any).outputText);

        const transformed = await transpiler.transform(buf);
        if (transformed !== '')
          Bun.write(`${LIB}/${pathNoExt}.js`, transformed.replace(/const /g, 'let '));

        exports[
          pathNoExt === 'index'
            ? '.'
            : './' + (pathNoExt.endsWith('/index')
              ? pathNoExt.slice(0, -6)
              : pathNoExt
            )
        ] = './' + pathNoExt + (transformed === '' ? '.d.ts' : '.js');
      })()
    );
  }

  await Promise.all(promises);

  delete pkg.devDependencies;
  delete pkg.scripts;

  Bun.write(LIB + '/package.json', JSON.stringify(pkg, null, 2));
  cp(ROOT, LIB, 'README.md');
})();

// Build examples
{
  interface Chunk {
    content: string,
    priority: number
  }

  const desc = (props: { desc?: string }) => props.desc == null ? '' : props.desc + '\n';

  let bufs: Chunk[] = [
    {
      content: await Bun.file(ROOT + '/README.md').text(),
      priority: Infinity
    }
  ]

  const process = async (path: string) => {
    let content = '';
    const config = (await import(path + '/config.ts')).default as Config;

    content += `## ${config.heading}\n${desc(config)}`;
    for (const [name, example] of Object.entries(config.examples)) {
      content += `${example.heading == null ? '' : '### ' + example.heading}\n${desc(example)}`;

      const code = (await readFile(path + '/' + name + '.ts')).toString();
      content += '```ts\n' + (code.endsWith('\n') ? code : code + '\n') + '```\n\n';
    }

    bufs.push({
      content, priority: config.priority ?? 0
    });
  }

  await Promise.all(
    [...new Bun.Glob('*').scanSync({
      cwd: EXAMPLES,
      onlyFiles: false,
      absolute: true
    })].map(process)
  );

  Bun.write(
    LIB + '/README.md',
    bufs.toSorted((a, b) => b.priority - a.priority)
      .map((a) => a.content)
      .join('')
  );
}
