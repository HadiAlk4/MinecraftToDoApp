import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchGoogleAccount,
  listUpcomingEvents,
} from './GoogleCalendarApi.js';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    },
  };
}

test('creates an event and returns its id', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse(200, { id: 'evt-1', htmlLink: 'https://calendar.google.com/event?eid=evt-1', summary: 'Buy milk' });
  };

  const created = await createCalendarEvent({
    accessToken: 'token-a',
    event: { summary: 'Buy milk' },
    fetchImpl,
  });

  assert.equal(created.id, 'evt-1');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-a');
  assert.match(calls[0].url, /\/calendars\/primary\/events$/);
});

test('treats a missing event as already deleted', async () => {
  const fetchImpl = async () => jsonResponse(404, { error: { message: 'Not Found' } });
  const result = await deleteCalendarEvent({
    accessToken: 'token-a',
    eventId: 'gone',
    fetchImpl,
  });
  assert.equal(result.alreadyGone, true);
});

test('surfaces Google API error messages', async () => {
  const fetchImpl = async () => jsonResponse(401, { error: { message: 'Invalid Credentials' } });
  await assert.rejects(
    () => listUpcomingEvents({
      accessToken: 'expired',
      timeMin: '2026-11-01T00:00:00Z',
      fetchImpl,
    }),
    /Invalid Credentials/,
  );
});

test('reads the signed-in account email', async () => {
  const fetchImpl = async () => jsonResponse(200, { email: 'hadi@example.com', name: 'Hadi' });
  const account = await fetchGoogleAccount('token-a', fetchImpl);
  assert.deepEqual(account, { email: 'hadi@example.com', name: 'Hadi' });
});
