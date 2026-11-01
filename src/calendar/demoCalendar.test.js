import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addTodoToDemoCalendar,
  listUpcomingDemoEvents,
  removeDemoEvent,
} from './demoCalendar.js';

const now = new Date(2026, 10, 1, 15, 0, 0);

test('adds a signed-in to-do and hides events from earlier days', () => {
  const { events, created } = addTodoToDemoCalendar([], {
    title: 'Buy milk',
    description: 'From the shop',
    dueDate: '2026-11-04',
    dueTime: '14:30',
    timeZone: 'Australia/Brisbane',
    id: 'demo-milk',
  });

  assert.equal(created.id, 'demo-milk');
  assert.equal(events[0].start, '2026-11-04T14:30:00');

  const yesterday = {
    id: 'demo-old',
    summary: 'Old task',
    start: '2026-10-31T09:00:00',
    end: '2026-10-31T10:00:00',
    htmlLink: '',
  };
  const upcoming = listUpcomingDemoEvents([...events, yesterday], now);
  assert.deepEqual(upcoming.map((event) => event.id), ['demo-milk']);
  assert.equal(removeDemoEvent(events, 'demo-milk').length, 0);
});
