import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import path from 'node:path';

const pages = [
  'index.html',
  'om-mig.html',
  'erfarenheter.html',
  'projekt.html',
  'samarbeten.html',
  'kontakt.html'
];

export default defineConfig({
  root: 'src',
  publicDir: false,
  plugins: [
    handlebars({
      partialDirectory: path.resolve(import.meta.dirname, 'src/partials'),
      context(pagePath) {
        const page = path.basename(pagePath || 'index.html');
        return {
          isHome: page === 'index.html',
          isAbout: page === 'om-mig.html',
          isExperience: page === 'erfarenheter.html',
          isPortfolio: page === 'projekt.html',
          isCollaborations: page === 'samarbeten.html',
          isContact: page === 'kontakt.html'
        };
      }
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [path.basename(page, '.html'), path.resolve(import.meta.dirname, 'src', page)])
      )
    }
  }
});
