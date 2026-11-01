const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseDueParts(dueDate, dueTime) {
  const dateMatch = DATE_PATTERN.exec(dueDate);
  const timeMatch = TIME_PATTERN.exec(dueTime);
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12 || hour > 23 || minute > 59) {
    return null;
  }

  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, hour, minute };
}

export function isValidDue(dueDate, dueTime) {
  return parseDueParts(dueDate, dueTime) !== null;
}

function formatLocalDateTime({ year, month, day, hour, minute }) {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
}

function addOneHour(parts) {
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0));
  utc.setUTCHours(utc.getUTCHours() + 1);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
    hour: utc.getUTCHours(),
    minute: utc.getUTCMinutes(),
  };
}

export function buildCalendarEvent({ title, description, dueDate, dueTime, timeZone }) {
  const parts = parseDueParts(dueDate, dueTime);
  if (!parts) {
    throw new Error('Use a real date (YYYY-MM-DD) and time (HH:MM).');
  }
  if (!timeZone) {
    throw new Error('A time zone is required to create a calendar event.');
  }

  const summary = String(title ?? '').trim();
  if (!summary) {
    throw new Error('A title is required to create a calendar event.');
  }

  return {
    summary,
    description: String(description ?? '').trim(),
    start: {
      dateTime: formatLocalDateTime(parts),
      timeZone,
    },
    end: {
      dateTime: formatLocalDateTime(addOneHour(parts)),
      timeZone,
    },
  };
}

export function formatDueLabel(dueDate, dueTime) {
  if (!dueDate && !dueTime) {
    return '';
  }
  if (dueDate && dueTime) {
    return `${dueDate} ${dueTime}`;
  }
  return dueDate || dueTime;
}

export function formatEventStart(start) {
  if (!start || !String(start).includes('T')) {
    return start || '';
  }
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) {
    return start;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
