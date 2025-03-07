/// <reference types='bun-types' />
import type { Config } from '../examples/types';
import { existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path/posix';

import { transpileDeclaration } from 'typescript';
import tsconfig from '../tsconfig.json';
import { cpToLib, EXAMPLES, LIB, ROOT } from './utils';
import { readFile } from 'node:fs/promises';

// Constants
const ROOTDIR = resolve(import.meta.dir, '..');
const SOURCEDIR = `${ROOTDIR}/src`;
const OUTDIR = join(ROOTDIR, tsconfig.compilerOptions.declarationDir);

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'node',

  // Lighter output
  minifyWhitespace: true,
  treeShaking: true
});

// Build source files
console.log('Building source files...');
for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCEDIR)) {
  const srcPath = `${SOURCEDIR}/${path}`;

  const pathExtStart = path.lastIndexOf('.');
  const outPathNoExt = `${OUTDIR}/${path.substring(0, pathExtStart >>> 0)}`;

  Bun.file(srcPath)
    .text()
    .then((buf) => {
      transpiler.transform(buf)
        .then((res) => {
          if (res.length !== 0)
            Bun.write(`${outPathNoExt}.js`, res.replace(/const /g, 'let '));
        });

      Bun.write(`${outPathNoExt}.d.ts`, transpileDeclaration(buf, tsconfig as any).outputText);
    });
}

// Write required files to libs
console.log('Copying files...');
cpToLib('package.json');

// Build examples
console.log('Building examples...');
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

    content += `# ${config.heading}\n${desc(config)}`;
    for (const [name, example] of Object.entries(config.examples)) {
      content += `${example.heading == null ? '' : '## ' + example.heading}\n${desc(example)}`;

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
