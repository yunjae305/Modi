import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('Vercel serves the Vite SPA for direct client routes', () => {
  assert.equal(existsSync('vercel.json'), true);

  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    headers?: { source: string; headers: { key: string; value: string }[] }[];
    rewrites?: { source: string; destination: string }[];
  };

  assert.deepEqual(config.headers, [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
    {
      source: '/data/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
        {
          key: 'Content-Type',
          value: 'application/json; charset=utf-8',
        },
      ],
    },
  ]);

  assert.deepEqual(config.rewrites, [
    {
      source: '/api/stocks',
      destination: '/api/[resource]?resource=stocks',
    },
    {
      source: '/api/portfolio',
      destination: '/api/[resource]?resource=portfolio',
    },
    {
      source: '/api/executions',
      destination: '/api/[resource]?resource=executions',
    },
    {
      source: '/api/rankings',
      destination: '/api/[resource]?resource=rankings',
    },
    {
      source: '/api/orders/buy',
      destination: '/api/orders/[side]?side=buy',
    },
    {
      source: '/api/orders/sell',
      destination: '/api/orders/[side]?side=sell',
    },
    {
      source: '/api/auth/oauth/kakao/authorize',
      destination: '/api/auth/oauth/kakao/[step]?step=authorize',
    },
    {
      source: '/api/auth/oauth/kakao/callback',
      destination: '/api/auth/oauth/kakao/[step]?step=callback',
    },
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ]);
});
