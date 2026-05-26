import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('결과 페이지는 로그인 저장 없이 시나리오 결과만 표시한다', () => {
  const resultPage = readFileSync('src/pages/ResultPage.tsx', 'utf8');

  assert.equal(existsSync('src/services/results.ts'), false);
  assert.equal(existsSync('src/components/result/RecentResults.tsx'), false);

  for (const forbidden of ['useAuthStore', 'saveResultRecord', 'getResultRecords', 'RecentResults', '로그인']) {
    assert.equal(resultPage.includes(forbidden), false, forbidden);
  }
});
