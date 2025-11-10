import type { Event } from "@/types";

type BuildICSEventOptions = {
  durationMinutes?: number;
  eventUrl?: string | null;
  generatedAt?: Date;
};

const LINE_BREAK = "\r\n";

export function buildICSFromEvent(
  event: Event,
  options: BuildICSEventOptions = {}
) {
  const {
    durationMinutes = 60,
    eventUrl = null,
    generatedAt = new Date(),
  } = options;

  const start = new Date(event.event_date);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid event date");
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GamePlan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeICalText(`${event.id}@gameplan`)}`,
    `SUMMARY:${escapeICalText(event.name)}`,
    `DTSTAMP:${formatICalDate(generatedAt)}`,
    `DTSTART:${formatICalDate(start)}`,
    `DTEND:${formatICalDate(end)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  lines.push(`LOCATION:${escapeICalText(event.venue)}`);

  if (eventUrl) {
    lines.push(`URL:${escapeICalText(eventUrl)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join(LINE_BREAK).concat(LINE_BREAK);
}

function formatICalDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICalText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

