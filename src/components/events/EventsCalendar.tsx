import { format } from "date-fns";
import { Calendar, ExternalLink } from "lucide-react";
import type { UpcomingEvent } from "@/lib/events";

/**
 * Extracted verbatim from the old /media route when the events calendar moved
 * under Student Life -> News & Events. Same markup, same behaviour; it lives
 * here now so the page that renders it and any future page can share it.
 */
export function EventCard({ event, index }: { event: UpcomingEvent; index: number }) {
  const start = new Date(event.starts_at);
  const gcal = new URL("https://calendar.google.com/calendar/render");
  gcal.searchParams.set("action", "TEMPLATE");
  gcal.searchParams.set("text", event.title);
  gcal.searchParams.set(
    "dates",
    `${format(start, "yyyyMMdd")}/${event.ends_at ? format(new Date(event.ends_at), "yyyyMMdd") : format(start, "yyyyMMdd")}`,
  );
  gcal.searchParams.set("details", event.description || "");
  gcal.searchParams.set("location", event.location || "");

  const icsStart = format(start, "yyyyMMdd'T'HHmmss");
  const icsEnd = event.ends_at
    ? format(new Date(event.ends_at), "yyyyMMdd'T'HHmmss")
    : format(new Date(new Date(start).setHours(start.getHours() + 2)), "yyyyMMdd'T'HHmmss");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${icsStart}`,
    `DTEND:${icsEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    event.location ? `LOCATION:${event.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return (
    <article className="group grid grid-cols-[auto_1fr] gap-5 p-5 rounded-2xl border border-border bg-card hover:border-flag-red transition-colors">
      <div className="size-16 grid place-items-center rounded-xl bg-flag-yellow text-flag-black font-display font-bold">
        <div className="text-center leading-none">
          <div className="text-xl">{format(start, "d")}</div>
          <div className="text-[10px] uppercase mt-0.5">{format(start, "MMM")}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {format(start, "h:mm a")}
          </span>
          {event.location && <span>· {event.location}</span>}
        </div>
        <h3 className="mt-1.5 font-display font-bold text-lg truncate group-hover:text-flag-red">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={gcal.toString()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-flag-red hover:text-flag-red"
          >
            <ExternalLink className="size-3" /> Add to Google Calendar
          </a>
          <a
            href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
            download={`${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-flag-red hover:text-flag-red"
          >
            Download .ics
          </a>
        </div>
      </div>
    </article>
  );
}

export function MiniCalendar({ events }: { events: UpcomingEvent[] }) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const eventDays = new Set(events.map((e) => new Date(e.starts_at).getDate()));

  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`b${i}`} />);
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const hasEvent = eventDays.has(day);
    return (
      <div
        key={day}
        className={`flex size-8 items-center justify-center rounded-full text-sm ${
          hasEvent ? "bg-flag-red text-white font-bold" : "text-foreground"
        }`}
      >
        {day}
      </div>
    );
  });

  return (
    <div>
      <div className="text-center text-sm font-semibold mb-3">{format(now, "MMMM yyyy")}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {blanks}
        {cells}
      </div>
    </div>
  );
}
