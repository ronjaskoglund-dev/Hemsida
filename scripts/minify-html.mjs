import { minify } from 'html-minifier-terser';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDirectory = path.resolve('dist');
const files = (await readdir(distDirectory)).filter((file) => file.endsWith('.html'));

await Promise.all(files.map(async (file) => {
  const filePath = path.join(distDirectory, file);
  const source = await readFile(filePath, 'utf8');
  const output = await minify(source, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeRedundantAttributes: false,
    removeOptionalTags: false,
    sortAttributes: false,
    sortClassName: false
  });
  await writeFile(filePath, output);
}));
