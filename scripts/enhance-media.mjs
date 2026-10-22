import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = path.resolve('src');
const imageRoot = path.join(sourceRoot, 'assets/images');
const eagerImages = new Set(['ronja-about-left.png', 'banner.png']);

const htmlFiles = (await readdir(sourceRoot))
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.join(sourceRoot, file));
htmlFiles.push(path.join(sourceRoot, 'partials/header.html'), path.join(sourceRoot, 'partials/footer.html'));

const dimensions = new Map();
const imageFiles = await readdir(imageRoot);
const availableImages = new Set(imageFiles);
for (const file of imageFiles) {
  if (!/\.(?:avif|jpe?g|png|svg|webp)$/i.test(file)) continue;
  const metadata = await sharp(path.join(imageRoot, file)).metadata();
  if (metadata.width && metadata.height) dimensions.set(file, [metadata.width, metadata.height]);
}

for (const htmlFile of htmlFiles) {
  let html = await readFile(htmlFile, 'utf8');
  html = html.replace(/<img\b[^>]*>/gi, (tag, offset, documentHtml) => {
    const source = tag.match(/\bsrc=["']\.\/assets\/images\/([^"']+)["']/i);
    if (!source) return tag;

    const file = source[1];
    const [width, height] = dimensions.get(file) || [];
    let enhanced = tag;
    if (width && !/\bwidth=/i.test(enhanced)) enhanced = enhanced.replace(/<img\b/i, `<img width="${width}"`);
    if (height && !/\bheight=/i.test(enhanced)) enhanced = enhanced.replace(/<img\b/i, `<img height="${height}"`);
    if (!/\bdecoding=/i.test(enhanced)) enhanced = enhanced.replace(/<img\b/i, '<img decoding="async"');
    if (!/\bloading=/i.test(enhanced)) {
      const priority = eagerImages.has(file) ? 'eager' : 'lazy';
      enhanced = enhanced.replace(/<img\b/i, `<img loading="${priority}"`);
      if (priority === 'eager') enhanced = enhanced.replace(/<img\b/i, '<img fetchpriority="high"');
    }

    const webp = `${path.parse(file).name}.webp`;
    if (!availableImages.has(webp)) return enhanced;
    const precedingMarkup = documentHtml.slice(Math.max(0, offset - 180), offset);
    if (/<picture\b[^>]*class=["'][^"']*optimized-picture[^"']*["'][^>]*>[^<]*<source\b[^>]*>[^<]*$/i.test(precedingMarkup)) {
      return enhanced;
    }
    return `<picture class="optimized-picture"><source srcset="./assets/images/${webp}" type="image/webp">${enhanced}</picture>`;
  });
  await writeFile(htmlFile, html);
}
