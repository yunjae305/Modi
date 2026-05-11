import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('Vercel API와 Supabase 1차 모의투자 표면이 존재한다', () => {
  const files = [
    'api/auth/providers.ts',
    'api/auth/guest.ts',
    'api/auth/me.ts',
    'api/auth/logout.ts',
    'api/auth/oauth/kakao/authorize.ts',
    'api/auth/oauth/kakao/callback.ts',
    'api/stocks.ts',
    'api/portfolio.ts',
    'api/executions.ts',
    'api/rankings.ts',
    'api/orders/buy.ts',
    'api/orders/sell.ts',
    'api/prices/sync.ts',
    'supabase/schema.sql',
  ];

  for (const file of files) {
    assert.equal(existsSync(file), true, file);
  }

  const env = readFileSync('.env.example', 'utf8');
  const schema = readFileSync('supabase/schema.sql', 'utf8');

  assert.match(env, /SUPABASE_URL=/);
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(env, /KIS_APP_KEY=/);
  assert.match(env, /KIS_APP_SECRET=/);
  assert.match(schema, /create table if not exists public\.latest_prices/);
  assert.match(schema, /alter publication supabase_realtime/);
});
