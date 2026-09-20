// Build step: write a crawlable home page to dist/index.html (heading, intro, project links,
// JSON-LD) and keep the untouched app shell as dist/app-shell.html for the serverless function.
// Vercel serves static files before rewrites, so "/" must be prerendered here at build time.
import fs from 'fs';
import path from 'path';
import { renderHomeForBuild } from '../api/index';

const dist = path.join(process.cwd(), 'dist');
const indexPath = path.join(dist, 'index.html');
const shellPath = path.join(dist, 'app-shell.html');
const shell = fs.readFileSync(indexPath, 'utf8');
if (shell.includes('id="seo-prerender"')) {
  console.error('dist/index.html is already prerendered; run vite build first.');
  process.exit(1);
}
fs.writeFileSync(shellPath, shell, 'utf8');
renderHomeForBuild(shell)
  .then(html => { fs.writeFileSync(indexPath, html, 'utf8'); console.log(`[prerender-home] wrote dist/index.html (${html.length} bytes) and dist/app-shell.html`); })
  .catch(err => { console.error('[prerender-home] failed, keeping the plain shell:', err); });
