const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export const CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
];

async function readBody(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function calendarError(response, body, fallback) {
  const message = body?.error?.message || fallback;
  const error = new Error(message);
  error.status = response.status;
  return error;
}

export async function fetchGoogleAccount(accessToken, fetchImpl = fetch) {
  const response = await fetchImpl(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await readBody(response);
  if (!response.ok) {
    throw calendarError(response, body, 'Could not read the Google account.');
  }
  return {
    email: body.email || '',
    name: body.name || '',
  };
}

export async function createCalendarEvent({
  accessToken,
  event,
  calendarId = 'primary',
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  );
  const body = await readBody(response);
  if (!response.ok) {
    throw calendarError(response, body, 'Could not create the calendar event.');
  }
  return {
    id: body.id,
    htmlLink: body.htmlLink || '',
    summary: body.summary || event.summary,
  };
}

export async function deleteCalendarEvent({
  accessToken,
  eventId,
  calendarId = 'primary',
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (response.status === 404 || response.status === 410) {
    return { alreadyGone: true };
  }
  if (!response.ok) {
    const body = await readBody(response);
    throw calendarError(response, body, 'Could not delete the calendar event.');
  }
  return { alreadyGone: false };
}

export async function listUpcomingEvents({
  accessToken,
  calendarId = 'primary',
  timeMin,
  maxResults = 8,
  fetchImpl = fetch,
}) {
  const params = new URLSearchParams({
    timeMin,
    maxResults: String(maxResults),
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  const response = await fetchImpl(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  const body = await readBody(response);
  if (!response.ok) {
    throw calendarError(response, body, 'Could not load calendar events.');
  }

  return (body.items || []).map((item) => ({
    id: item.id,
    summary: item.summary || '(No title)',
    htmlLink: item.htmlLink || '',
    start: item.start?.dateTime || item.start?.date || '',
    end: item.end?.dateTime || item.end?.date || '',
  }));
}
