import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { UpcomingEvent } from "@/lib/events";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function diff(target: Date) {
  const now = Date.now();
  const d = target.getTime() - now;
  if (d <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
}

export function EventCountdown({
  events,
  initialIndex = 0,
}: {
  events: UpcomingEvent[];
  initialIndex?: number;
}) {
  const [idx, setIdx] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, events.length - 1)),
  );
  const [ticks, setTicks] = useState(() => diff(new Date(events[idx]?.starts_at ?? Date.now())));
  const [noMotion, setNoMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setNoMotion(mq.matches);
    if (!mq.matches) return;
    return () => {};
  }, []);

  useEffect(() => {
    setIdx(Math.min(Math.max(0, initialIndex), Math.max(0, events.length - 1)));
  }, [initialIndex, events.length]);

  useEffect(() => {
    const id = setInterval(() => {
      const target = new Date(events[idx].starts_at);
      const remaining = diff(target);
      setTicks(remaining);

      if (
        remaining.days === 0 &&
        remaining.hours === 0 &&
        remaining.minutes === 0 &&
        remaining.seconds === 0
      ) {
        setIdx((i) => {
          const next = i + 1;
          return next < events.length ? next : i;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [events, idx]);

  const event = events[idx];
  if (!events.length || !event) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <Calendar className="size-8 text-flag-red mx-auto" />
        <h3 className="mt-4 font-display font-bold text-xl">No upcoming events right now</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon — we add new dates throughout the term.
        </p>
      </div>
    );
  }

  const target = new Date(event.starts_at);
  const isToday = format(target, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const units = [
    { label: "Days", value: ticks.days },
    { label: "Hours", value: ticks.hours },
    { label: "Minutes", value: ticks.minutes },
    { label: "Seconds", value: ticks.seconds },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elegant">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-flag-red">
        <Calendar className="size-4" /> Countdown
      </div>

      <div className="mt-4">
        <h3 className="font-display font-black text-2xl md:text-3xl leading-tight">
          {event.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {isToday ? "Today" : format(target, "EEEE, d MMMM yyyy")}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {units.map((u) => (
          <div key={u.label} className="rounded-2xl bg-flag-black p-3 text-center md:p-4">
            <div
              className={`font-display font-black text-flag-yellow leading-none ${noMotion ? "" : "tabular-nums"}`}
              style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)" }}
              aria-live="polite"
            >
              {pad(u.value)}
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-widest text-white/60 md:text-xs">
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
