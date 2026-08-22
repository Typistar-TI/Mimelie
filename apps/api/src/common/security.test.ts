import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { decryptSecret, encryptSecret, safeEqual, tokenHash } from './security.js';

before(() => { process.env.SESSION_SECRET = 'test-session-secret-with-more-than-thirty-two-characters'; process.env.TOKEN_ENCRYPTION_KEY = 'test-encryption-key'; });
describe('security primitives', () => {
  it('round trips encrypted provider tokens without storing plaintext', () => { const encrypted = encryptSecret('provider-secret'); assert.notEqual(encrypted, 'provider-secret'); assert.equal(decryptSecret(encrypted), 'provider-secret'); });
  it('hashes opaque tokens deterministically', () => { assert.equal(tokenHash('a'), tokenHash('a')); assert.notEqual(tokenHash('a'), tokenHash('b')); });
  it('compares equal values without accepting different lengths', () => { assert.equal(safeEqual('same', 'same'), true); assert.equal(safeEqual('same', 'different'), false); });
});
