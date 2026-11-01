import { buildCalendarEvent } from './eventPayload.js';

function pad(value) {
  return String(value).padStart(2, '0');
}

function shiftDate(now, days, hour, minute) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function seedDemoEvents(now = new Date()) {
  return [
    {
      id: 'demo-feed-cat',
      summary: 'Feed the cat',
      start: shiftDate(now, 1, 9, 0),
      end: shiftDate(now, 1, 10, 0),
      htmlLink: '',
    },
    {
      id: 'demo-mine',
      summary: 'Mine for diamonds',
      start: shiftDate(now, 2, 18, 0),
      end: shiftDate(now, 2, 19, 0),
      htmlLink: '',
    },
    {
      id: 'demo-chest',
      summary: 'Sort the chest',
      start: shiftDate(now, 3, 12, 30),
      end: shiftDate(now, 3, 13, 30),
      htmlLink: '',
    },
  ];
}

export function listUpcomingDemoEvents(events, now = new Date()) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return [...events]
    .filter((event) => {
      const when = new Date(event.start).getTime();
      return !Number.isNaN(when) && when >= startOfDay;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

export function addTodoToDemoCalendar(events, { title, description, dueDate, dueTime, timeZone, id }) {
  const payload = buildCalendarEvent({ title, description, dueDate, dueTime, timeZone });
  const event = {
    id: id || `demo-${Date.now()}`,
    summary: payload.summary,
    description: payload.description,
    start: payload.start.dateTime,
    end: payload.end.dateTime,
    htmlLink: '',
  };
  return {
    events: [...events, event],
    created: { id: event.id, htmlLink: '', summary: event.summary },
  };
}

export function removeDemoEvent(events, eventId) {
  return events.filter((event) => event.id !== eventId);
}

export function isDemoEventId(eventId) {
  return String(eventId || '').startsWith('demo-');
}
