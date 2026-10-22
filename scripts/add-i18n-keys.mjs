import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const scriptPath = path.resolve('src/scripts/language.js');
const languageSource = await readFile(scriptPath, 'utf8');

const readObject = (name) => {
  const match = languageSource.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n    \\});`));
  if (!match) throw new Error(`Could not find ${name} in language.js`);
  return JSON.parse(match[1]);
};

const text = readObject('translations');
const attributes = readObject('attributeTranslations');
const titles = readObject('titleTranslations');
const normalize = (value) => value.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const keyFor = (prefix, value) => `${prefix}.${createHash('sha1').update(value).digest('hex').slice(0, 10)}`;

const textBySwedish = new Map(Object.entries(text).map(([sv, en]) => [normalize(sv), { key: keyFor('text', sv), sv, en }]));
const attributeBySwedish = new Map(Object.entries(attributes).map(([sv, en]) => [normalize(sv), { key: keyFor('attribute', sv), sv, en }]));
const titleBySwedish = new Map(Object.entries(titles).map(([sv, en]) => [normalize(sv), { key: keyFor('title', sv), sv, en }]));

const root = path.resolve('src');
const files = (await readdir(root)).filter((file) => file.endsWith('.html')).map((file) => path.join(root, file));
files.push(path.join(root, 'partials/header.html'), path.join(root, 'partials/footer.html'));

for (const file of files) {
  let html = await readFile(file, 'utf8');
  if (html.includes('data-i18n=')) throw new Error(`${path.relative(root, file)} already contains i18n keys`);

  const pageTitle = normalize(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const titleEntry = titleBySwedish.get(pageTitle);
  if (titleEntry) html = html.replace(/<html\b/i, `<html data-i18n-page="${titleEntry.key}"`);

  let skippedElement = '';
  html = html.split(/(<[^>]+>)/g).map((token) => {
    if (!token) return token;
    if (token.startsWith('<')) {
      const closing = token.match(/^<\/(script|style|noscript)/i);
      if (closing) skippedElement = '';
      const opening = token.match(/^<(script|style|noscript)\b/i);
      if (opening) skippedElement = opening[1].toLowerCase();

      let enhanced = token;
      for (const attributeName of ['placeholder', 'aria-label', 'title']) {
        const valueMatch = enhanced.match(new RegExp(`\\b${attributeName}=["']([^"']+)["']`, 'i'));
        if (!valueMatch) continue;
        const entry = attributeBySwedish.get(normalize(valueMatch[1]));
        if (entry) enhanced = enhanced.replace(/>$/, ` data-i18n-${attributeName}="${entry.key}">`);
      }
      return enhanced;
    }
    if (skippedElement) return token;

    const normalized = normalize(token);
    if (!normalized) return token;
    const entry = textBySwedish.get(normalized);
    if (entry) {
      const leading = token.match(/^\s*/)?.[0] || '';
      const trailing = token.match(/\s*$/)?.[0] || '';
      return `${leading}<span data-i18n="${entry.key}">${token.slice(leading.length, token.length - trailing.length)}</span>${trailing}`;
    }

    const views = normalized.match(/^([\d\s,.]+)\s*k\s+visningar$/i);
    if (views) {
      const leading = token.match(/^\s*/)?.[0] || '';
      const trailing = token.match(/\s*$/)?.[0] || '';
      return `${leading}<span data-i18n-views="${views[1].trim()}">${normalized}</span>${trailing}`;
    }
    return token;
  }).join('');

  await writeFile(file, html);
}

const keyed = (entries, prefix) => Object.fromEntries(
  Object.entries(entries).map(([sv, en]) => [keyFor(prefix, sv), { sv, en }])
);

const generated = `// Generated from the preserved Swedish and English site copy.\n` +
  `export const textTranslations = ${JSON.stringify(keyed(text, 'text'), null, 2)};\n\n` +
  `export const attributeTranslations = ${JSON.stringify(keyed(attributes, 'attribute'), null, 2)};\n\n` +
  `export const titleTranslations = ${JSON.stringify(keyed(titles, 'title'), null, 2)};\n`;

await writeFile(path.resolve('src/scripts/translations.js'), generated);
