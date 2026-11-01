import { buildCalendarEvent } from './eventPayload.js';

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
