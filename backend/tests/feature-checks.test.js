import test from 'node:test';
import assert from 'node:assert/strict';

import { validateGroupMembershipInput, validateMentorshipRating, validateCategoryName } from '../src/services/feature-checks.service.js';

test('group membership validation rejects duplicate joins', () => {
  assert.throws(() => validateGroupMembershipInput({ userId: 'u1', groupId: 'g1', existingMemberships: [{ userId: 'u1', groupId: 'g1', status: 'APPROVED' }] }), /já está/);
});

test('mentorship rating validation enforces 1-5 range', () => {
  assert.throws(() => validateMentorshipRating({ rating: 0, comment: 'ok' }), /1 a 5/);
});

test('category validation requires naming', () => {
  assert.throws(() => validateCategoryName({ name: '   ' }), /nome/);
});
