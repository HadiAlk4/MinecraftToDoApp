import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addTodoToDemoCalendar,
  listUpcomingDemoEvents,
  removeDemoEvent,
  seedDemoEvents,
} from './demoCalendar.js';

const now = new Date(2026, 10, 1, 15, 0, 0);

test('seeds three upcoming demo events', () => {
  const events = seedDemoEvents(now);
  assert.deepEqual(events.map((event) => event.summary), [
    'Feed the cat',
    'Mine for diamonds',
    'Sort the chest',
  ]);
  assert.equal(events[0].start, '2026-11-02T09:00:00');
  assert.equal(listUpcomingDemoEvents(events, now).length, 3);
});

test('adds a to-do and hides events from earlier days', () => {
  const seeded = seedDemoEvents(now);
  const { events, created } = addTodoToDemoCalendar(seeded, {
    title: 'Buy milk',
    description: 'From the shop',
    dueDate: '2026-11-04',
    dueTime: '14:30',
    timeZone: 'Australia/Brisbane',
    id: 'demo-milk',
  });

  assert.equal(created.id, 'demo-milk');
  assert.equal(events.at(-1).start, '2026-11-04T14:30:00');

  const yesterday = {
    id: 'demo-old',
    summary: 'Old task',
    start: '2026-10-31T09:00:00',
    end: '2026-10-31T10:00:00',
    htmlLink: '',
  };
  const upcoming = listUpcomingDemoEvents([...events, yesterday], now);
  assert.equal(upcoming.some((event) => event.id === 'demo-old'), false);
  assert.equal(removeDemoEvent(events, 'demo-milk').some((event) => event.id === 'demo-milk'), false);
});
