import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCalendarEvent, formatDueLabel, formatEventStart, isValidDue } from './eventPayload.js';

test('accepts a real calendar date and 24-hour time', () => {
  assert.equal(isValidDue('2026-11-02', '09:05'), true);
  assert.equal(isValidDue('2026-02-31', '10:00'), false);
  assert.equal(isValidDue('2026-11-02', '24:00'), false);
  assert.equal(isValidDue('02-11-2026', '09:05'), false);
});

test('builds a one-hour Google Calendar event in the given time zone', () => {
  const event = buildCalendarEvent({
    title: '  Buy milk  ',
    description: '  From the corner shop  ',
    dueDate: '2026-11-02',
    dueTime: '14:30',
    timeZone: 'Australia/Brisbane',
  });

  assert.deepEqual(event, {
    summary: 'Buy milk',
    description: 'From the corner shop',
    start: { dateTime: '2026-11-02T14:30:00', timeZone: 'Australia/Brisbane' },
    end: { dateTime: '2026-11-02T15:30:00', timeZone: 'Australia/Brisbane' },
  });
});

test('rolls the end time into the next day', () => {
  const event = buildCalendarEvent({
    title: 'Late task',
    description: '',
    dueDate: '2026-12-31',
    dueTime: '23:15',
    timeZone: 'Australia/Brisbane',
  });

  assert.equal(event.end.dateTime, '2027-01-01T00:15:00');
});

test('rejects an event with no title', () => {
  assert.throws(
    () => buildCalendarEvent({
      title: '   ',
      description: 'notes',
      dueDate: '2026-11-02',
      dueTime: '14:30',
      timeZone: 'Australia/Brisbane',
    }),
    /title/i,
  );
});

test('formats the due label shown on a to-do', () => {
  assert.equal(formatDueLabel('2026-11-02', '14:30'), '2026-11-02 14:30');
  assert.equal(formatDueLabel('', ''), '');
});

test('leaves all-day event dates unchanged and ignores unreadable times', () => {
  assert.equal(formatEventStart('2026-11-02'), '2026-11-02');
  assert.equal(formatEventStart('not-a-date'), 'not-a-date');
  assert.equal(formatEventStart(''), '');
});
