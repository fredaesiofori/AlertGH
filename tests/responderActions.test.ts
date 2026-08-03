import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResponderIncidentUpdate, getOfficialSeverity } from '../src/utils';

test('buildResponderIncidentUpdate only includes provided responder fields', () => {
  const update = buildResponderIncidentUpdate({
    status: 'investigating',
    officialSeverity: 'high',
    reviewStatus: 'verified',
    reviewReason: 'Confirmed by field team',
    internalNotes: 'Route cleared for ambulances',
    assignedAgency: 'NADMO',
  });

  assert.deepEqual(update, {
    status: 'investigating',
    officialSeverity: 'high',
    reviewStatus: 'verified',
    reviewReason: 'Confirmed by field team',
    internalNotes: 'Route cleared for ambulances',
    assignedAgency: 'NADMO',
  });
});

test('getOfficialSeverity prefers the responder override when provided', () => {
  assert.equal(getOfficialSeverity({ severity: 'medium', officialSeverity: 'critical' }), 'critical');
  assert.equal(getOfficialSeverity({ severity: 'medium' }), 'medium');
});
