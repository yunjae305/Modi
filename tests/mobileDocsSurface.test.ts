import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('최종 MD가 Vercel, Supabase 유저 DB, PWA 모바일 검증 기준을 설명한다', () => {
  const v5 = readFileSync('프로젝트_모디_v5_API추가.md', 'utf8');
  const v6 = readFileSync('프로젝트_모디_v6_모의투자대회_소셜로그인_확장.md', 'utf8');

  for (const doc of [v5, v6]) {
    assert.match(doc, /배포 및 모바일\/PWA 대응/);
    assert.match(doc, /로그인과 유저 DB/);
    assert.match(doc, /모바일 검증 기준/);
    assert.match(doc, /Vercel 환경변수/);
    assert.match(doc, /Supabase 유저 DB 포함/);
  }
});
