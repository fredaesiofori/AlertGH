import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReportDraft } from '../src/utils';

test('accepts a complete draft for anonymous reporting', () => {
  const result = validateReportDraft({
    title: 'Flooded road near Mallam',
    city: 'Mallam',
    description: 'Water is covering the road and traffic is blocked.',
    reporterName: '',
    isAnonymous: true,
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test('flags missing fields and overlong text', () => {
  const result = validateReportDraft({
    title: 'x'.repeat(201),
    city: '',
    description: 'y'.repeat(2100),
    reporterName: '',
    isAnonymous: false,
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.title || '', /200/);
  assert.match(result.errors.city || '', /required/i);
  assert.match(result.errors.description || '', /2000/i);
});
