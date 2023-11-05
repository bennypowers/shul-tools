import { parse, serialize, } from 'parse5'
import { query, createTextNode } from '@parse5/tools';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';

const isImportmapScript = node =>
     node.tagName === 'script'
  && node.attrs.find(x =>
        x.name === 'type'
     && x.value === 'importmap');

const importmap = await readFile(new URL('../public/importmap.json', import.meta.url), 'utf-8');

for (const htmlfile of await readdir(new URL('../public', import.meta.url), { recursive: true })) {
  if (htmlfile.endsWith('.html')) {
    const url = new URL(`../public/${htmlfile}`, import.meta.url);
    const isRoot = url.pathname
      .split('/')
      .filter(x => x !== 'index.html')
      .pop() === 'public';
    const document = parse(await readFile(url, 'utf-8'));
    const importmapscript = query(document, isImportmapScript)
    if (importmapscript) {
      importmapscript.childNodes = [
        createTextNode(`
      ${importmap
            .trim()
            .split('\n')
            .join(`\n      `)
            .replaceAll(
              './node_modules',
                `${isRoot ? '.' : '..'}/node_modules`
            )}
    `),
      ]
      await writeFile(url, serialize(document), 'utf-8');
    }
  }
}

