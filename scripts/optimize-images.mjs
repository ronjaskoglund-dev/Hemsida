import sharp from 'sharp';
import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';

const imageDirectory = path.resolve('src/assets/images');
const jobs = [
  ['banner.png', 1680],
  ['ronja-home-about-sharp.png', 1280],
  ['stats-content-image-sharp.png', 1960],
  ['ronja-about-left.png', 1536],
  ['ronja-content-creation-hair-v3.png', 1536],
  ['gallery-content-creation-v2.jpeg', 1280],
  ['inspiration-beauty.jpg', 1280],
  ['gallery-lifestyle-v2.jpeg', 1280],
  ['gallery-travel-v2.jpeg', 1280],
  ['inspiration-city-view.jpeg', 1280],
  ['contact-background.jpg', 1600],
  ['tiktok-cover-mamonde.png', 720],
  ['tiktok-cover-lyko.png', 720],
  ['tiktok-cover-fitberry.png', 720]
];

await mkdir(imageDirectory, { recursive: true });

for (const [file, width] of jobs) {
  const input = path.join(imageDirectory, file);
  try {
    await access(input);
  } catch {
    continue;
  }

  const output = path.join(imageDirectory, `${path.parse(file).name}.webp`);
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, smartSubsample: true })
    .toFile(output);
}
