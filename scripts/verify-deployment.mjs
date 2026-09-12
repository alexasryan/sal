import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const root = new URL(config.siteUrl);
const assets = new Set();
const results = [];
async function get(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, 'HTTP ' + response.status + ': ' + url);
      const body = await response.text();
      assert.ok(body.length, 'Empty resource: ' + url);
      return { body, type: response.headers.get('content-type') || '' };
    } catch (error) {
      last = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw last;
}
function asset(value) {
  if (value.startsWith('data:')) return;
  const url = new URL(value.replace(/&amp;/g, '&'), root);
  url.hash = '';
  if (url.origin === root.origin && url.pathname.startsWith(root.pathname) && /\.(?:js|css|woff2?|webp|svg)$/i.test(url.pathname)) assets.add(url.href);
}
for (const path of ['', 'privacy/', 'cookies/', 'legal/', 'terms/', 'payment-return/']) {
  const url = new URL(path, root).href;
  const { body } = await get(url);
  assert.match(body, /<html[^>]+lang="ru"/);
  assert.match(body, /<h1/);
  assert.ok(body.includes('rel="canonical" href="' + url + '"'), 'Wrong canonical: ' + url);
  if (!path) {
    assert.match(body, /Право на/);
    assert.match(body, /Демонстрационная форма/);
    const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
    for (const match of body.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), 'Broken anchor: ' + match[1]);
  }
  for (const match of body.matchAll(/(?:src|href)="([^"]+)"/g)) asset(match[1]);
  for (const match of body.matchAll(/srcset="([^"]+)"/gi)) for (const candidate of match[1].split(',')) asset(candidate.trim().split(/\s+/)[0]);
  results.push('200 ' + url);
}
for (const url of assets) {
  const { body, type } = await get(url);
  if (url.endsWith('.css')) {
    assert.ok(type.includes('text/css'), 'Wrong CSS MIME: ' + url);
    for (const match of body.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) asset(match[1]);
  }
  if (url.endsWith('.js')) assert.ok(/javascript/.test(type), 'Wrong JavaScript MIME: ' + url);
}
const robots = await get(new URL('robots.txt', root));
assert.ok(robots.body.includes(new URL('sitemap.xml', root).href));
const sitemap = await get(new URL('sitemap.xml', root));
assert.match(sitemap.body, /<urlset/);
assert.ok(sitemap.body.includes(new URL('privacy/', root).href));
console.log(results.join('\n'));
console.log('Checked ' + assets.size + ' published assets, internal anchors, unique IDs, canonical metadata, robots and sitemap.');
console.log('HTTP checks do not replace visual, keyboard or browser runtime checks.');
