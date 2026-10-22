import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const pages = ['index.html', 'om-mig.html', 'erfarenheter.html', 'projekt.html', 'samarbeten.html', 'kontakt.html'];
const distDirectory = path.resolve('dist');
const failures = [];

for (const page of pages) {
  const pagePath = path.join(distDirectory, page);
  try {
    await access(pagePath);
    const html = await readFile(pagePath, 'utf8');
    if (html.includes('<style')) failures.push(`${page} contains inline CSS`);
    if (html.includes('onclick=')) failures.push(`${page} contains an inline event handler`);
    if (html.includes('googletagmanager.com/gtm.js')) failures.push(`${page} loads analytics before consent`);
  } catch {
    failures.push(`${page} is missing`);
  }
}

const distFiles = await readdir(distDirectory, { recursive: true });
if (distFiles.some((file) => file.includes('archive') || file.includes('om-mig-backup'))) {
  failures.push('Archived files were included in dist');
}

const contactChunks = distFiles.filter((file) => file.endsWith('.js'));
let contactEndpointFound = false;
for (const file of contactChunks) {
  const contents = await readFile(path.join(distDirectory, file), 'utf8');
  if (contents.includes('api-eu1.hsforms.com/submissions/v3/integration/submit/149587357/4049832f-829a-4fed-b3b2-64427f166c7f')) {
    contactEndpointFound = true;
  }
}
if (!contactEndpointFound) failures.push('The verified HubSpot endpoint is missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Build check passed for ${pages.length} pages.`);
}
