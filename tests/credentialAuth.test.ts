import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPasswordHash,
  normalizeCredentialEmail,
  verifyPasswordHash,
} from '../api/_lib/password.ts';

test('이메일 로그인용 주소를 정규화하고 비밀번호를 해시로 검증한다', async () => {
  assert.equal(normalizeCredentialEmail('  USER@Example.COM  '), 'user@example.com');

  const hash = await createPasswordHash('modi-pass-1234');

  assert.notEqual(hash.includes('modi-pass-1234'), true);
  assert.equal(await verifyPasswordHash('modi-pass-1234', hash), true);
  assert.equal(await verifyPasswordHash('wrong-password', hash), false);
});
