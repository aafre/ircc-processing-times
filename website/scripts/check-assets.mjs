// Fails if any built HTML/JS references an /_astro/ asset that isn't in dist/ (it would 404 in production).
// Run after `astro build`: node scripts/check-assets.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const files = readdirSync(dist, { recursive: true }).filter((f) => /\.(html|js)$/.test(f));
const missing = new Set();

for (const f of files) {
  const text = readFileSync(join(dist, f), 'utf8');
  for (const [, ref] of text.matchAll(/["'(\/]_astro\/([\w.\-]+)/g)) {
    if (!existsSync(join(dist, '_astro', ref))) missing.add(`_astro/${ref} (in ${f})`);
  }
}

if (missing.size) {
  console.error(`Missing ${missing.size} asset(s):\n` + [...missing].join('\n'));
  process.exit(1);
}
console.log(`OK: all /_astro/ references in ${files.length} files exist`);
