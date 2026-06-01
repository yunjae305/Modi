import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('PWA 설치에 필요한 manifest, service worker, offline page, icon이 존재한다', () => {
  const files = [
    'public/manifest.webmanifest',
    'public/sw.js',
    'public/offline.html',
    'public/icons/modi-192.png',
    'public/icons/modi-512.png',
    'src/registerServiceWorker.ts',
  ];

  for (const file of files) {
    assert.equal(existsSync(file), true, file);
  }

  const manifest = readFileSync('public/manifest.webmanifest', 'utf8');
  const sw = readFileSync('public/sw.js', 'utf8');
  const html = readFileSync('index.html', 'utf8');
  const main = readFileSync('src/main.tsx', 'utf8');

  assert.match(manifest, /"name": "Modi"/);
  assert.match(manifest, /"display": "standalone"/);
  assert.match(manifest, /"start_url": "\/"/);
  assert.match(sw, /modi-pwa-v3/);
  assert.match(sw, /\/offline\.html/);
  assert.match(sw, /url\.pathname\.startsWith\('\/data\/'\)/);
  assert.match(sw, /cache: 'no-store'/);
  assert.equal(sw.includes("'/data/corona_stocks_2020.json'"), false);
  assert.equal(sw.includes("'/data/sp500_stocks_2008.json'"), false);
  assert.equal(sw.includes("'/data/nasdaq_stocks_2000.json'"), false);
  assert.match(html, /manifest\.webmanifest/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(main, /registerServiceWorker/);
});
