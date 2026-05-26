import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('Vercel serves the Vite SPA for direct client routes', () => {
  assert.equal(existsSync('vercel.json'), true);

  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    rewrites?: { source: string; destination: string }[];
  };

  assert.deepEqual(config.rewrites, [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ]);
});
