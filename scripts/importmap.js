import { readdir, readFile, writeFile } from 'node:fs/promises';
import { URL } from 'node:url';

/**
 * dear reader,
 *
 * I know parsing HTML with regex is stupid.
 * But also, there's only supposed to be one import map per page
 *
 * so, like,
 *
 *
 * chill.
 *
 */
const IMPORT_MAP_REGEX = /<script type="importmap">\n(.*)<\/script>/sgm;

const importmap = await readFile(new URL('../public/importmap.json', import.meta.url), 'utf-8');

for (const htmlfile of await readdir(new URL('../public', import.meta.url), { recursive: true })) {
  if (htmlfile.endsWith('.html')) {
    const url = new URL(`../public/${htmlfile}`, import.meta.url);
    const isRoot = url.pathname
      .split('/')
      .filter(x => x !== 'index.html')
      .pop() === 'public';
    await writeFile(url, (await readFile(url, 'utf-8'))
      .replace(IMPORT_MAP_REGEX, `\
<script type="importmap">
      ${importmap.trim().split('\n').join(`
      `).replaceAll('./node_modules', isRoot ? './node_modules' : '../node_modules')}
    </script>`), 'utf-8');
  }
}

