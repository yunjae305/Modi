import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

test('Vercel API는 현재 로그인에 필요한 함수만 배포한다', () => {
  const files = [
    'api/auth/providers.ts',
    'api/auth/register.ts',
    'api/auth/login.ts',
    'api/auth/me.ts',
    'api/auth/logout.ts',
    'api/auth/oauth/kakao/authorize.ts',
    'api/auth/oauth/kakao/callback.ts',
    'supabase/schema.sql',
  ];

  for (const file of files) {
    assert.equal(existsSync(file), true, file);
  }

  const env = readFileSync('.env.example', 'utf8');
  const schema = readFileSync('supabase/schema.sql', 'utf8');
  const obsoleteFiles = [
    'api/auth/guest.ts',
    'api/auth/supabase.ts',
    'api/auth/oauth/google/authorize.ts',
    'api/auth/oauth/google/callback.ts',
    'api/stocks.ts',
    'api/portfolio.ts',
    'api/executions.ts',
    'api/rankings.ts',
    'api/results.ts',
    'api/orders/buy.ts',
    'api/orders/sell.ts',
    'api/prices/sync.ts',
  ];

  assert.match(env, /SUPABASE_URL=/);
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(schema, /password_hash text/);
  assert.match(schema, /create table if not exists public\.latest_prices/);
  assert.match(schema, /grant select, insert, update, delete on table public\.users to service_role/);
  assert.match(schema, /notify pgrst, 'reload schema'/);
  assert.match(schema, /alter publication supabase_realtime/);
  assert.ok(vercelFunctionFiles('api').length <= 12);
  for (const file of obsoleteFiles) {
    assert.equal(existsSync(file), false, file);
  }
});

test('Vercel API functions compile with Node globals and node protocol imports', () => {
  const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8')) as {
    compilerOptions?: {
      types?: string[];
    };
  };

  assert.ok(tsconfig.compilerOptions?.types?.includes('node'));
});

test('Vercel API emitted JavaScript rewrites relative TypeScript imports', () => {
  const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8')) as {
    compilerOptions?: {
      rewriteRelativeImportExtensions?: boolean;
    };
  };

  assert.equal(tsconfig.compilerOptions?.rewriteRelativeImportExtensions, true);
});

test('Vercel API handlers use explicit TypeScript extensions for relative imports', () => {
  for (const file of vercelFunctionFiles('api')) {
    const source = readFileSync(file, 'utf8');
    const imports = source.matchAll(/from ['"](\.{1,2}\/[^'"]+)['"]/g);
    for (const match of imports) {
      assert.match(match[1], /\.ts$/, `${file} imports ${match[1]}`);
    }
  }
});

function vercelFunctionFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      if (name === '_lib') {
        return [];
      }
      return vercelFunctionFiles(path);
    }
    return name.endsWith('.ts') ? [path] : [];
  });
}
