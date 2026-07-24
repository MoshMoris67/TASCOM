import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CardGrid } from "@/components/motion";
import { Calendar, Bell, Image, Video, ArrowRight, ExternalLink } from "lucide-react";
import { photos } from "@/lib/photos";
import { GalleryPreview } from "@/components/gallery/Gallery";
import { fetchNews, type NewsPost } from "@/lib/news";
import { fetchMedia } from "@/lib/media";
import { fetchUpcomingEvents, type UpcomingEvent } from "@/lib/events";
import { EventCountdown } from "@/components/events/EventCountdown";

export const Route = createFileRoute("/media")({
  // News now comes from the `news` table that admin.news has always written to. If the
  // table is empty or unreachable, fetchNews hands back the three seed posts that used
  // to be hard-coded here — so this section never renders empty.
  loader: async () => ({
    posts: await fetchNews(6),
    media: await fetchMedia(),
    upcoming: await fetchUpcomingEvents(10),
  }),
  head: () => ({
    meta: [
      { title: "Media — Talents College Mukono" },
      {
        name: "description",
        content: "News, events, gallery highlights and media from Talents College Mukono.",
      },
      { property: "og:title", content: "Media — Talents College Mukono" },
      {
        property: "og:description",
        content: "All media and news from Talents College Mukono in one place.",
      },
      { property: "og:image", content: photos.campusAvenue },
    ],
  }),
  component: Media,
});

const highlights = [
  {
    label: "Events",
    icon: Calendar,
    description: "Term dates, parents' meetings, galas and cultural evenings — all on one page.",
    to: "/media" as const,
    hash: "events" as const,
  },
  {
    label: "Gallery",
    icon: Image,
    description: "Photo highlights from campus life and school events.",
    to: "/gallery" as const,
    hash: undefined,
  },
  {
    label: "Videos",
    icon: Video,
    description: "Watch Talents College in motion through our video stories.",
    to: undefined,
    hash: undefined,
  },
];

function Media() {
  const { posts, media, upcoming } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Media"
        title="News, gallery and media from Talents College Mukono."
        description="Browse announcements, campus life photos and featured videos in one place."
        image={photos.dignitariesWide}
        imageAlt="Staff and students on the school field during a college event"
        crumbs={[{ label: "Media" }]}
        tone="ink"
      />

      <Section>
        <CardGrid className="grid gap-8 lg:grid-cols-3" tilt>
          {highlights.map((card) => {
            const inner = (
              <>
                <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-4 text-flag-black">
                  <card.icon className="size-6" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold">{card.label}</h2>
                <p className="mt-3 text-muted-foreground">{card.description}</p>
                {card.to ? (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-flag-red">
                    Open <ArrowRight className="size-4" />
                  </span>
                ) : (
                  <span className="mt-4 inline-flex text-sm font-semibold text-muted-foreground">
                    Coming soon
                  </span>
                )}
              </>
            );

            // Two of these cards have somewhere to go; the video library doesn't
            // exist yet, so that one stays a plain card and says so rather than
            // pretending to be a link. `card.to` was previously read but never
            // set on any card, so the "Open" affordance rendered on none of them.
            return card.to ? (
              <Link
                key={card.label}
                to={card.to}
                hash={card.hash}
                className="rounded-3xl border border-border bg-card p-8 transition-all hover:border-flag-red"
              >
                {inner}
              </Link>
            ) : (
              <div key={card.label} className="rounded-3xl border border-border bg-card p-8">
                {inner}
              </div>
            );
          })}
        </CardGrid>
      </Section>

      <Section id="news">
        <div className="grid gap-10 lg:grid-cols-3">
          <CardGrid className="lg:col-span-2 space-y-6">
            {posts.map((post: NewsPost) => (
              <article
                key={post.slug}
                className="rounded-3xl border border-border bg-card p-8 transition-all hover:border-flag-red"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-flag-red/10 px-3 py-1 font-semibold text-flag-red">
                    {post.tag}
                  </span>
                  <span>{new Date(post.published_at).toDateString()}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-black">
                  <Link
                    to="/news/$slug"
                    params={{ slug: post.slug }}
                    className="transition-colors hover:text-flag-red"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
                <Link
                  to="/news/$slug"
                  params={{ slug: post.slug }}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-flag-red transition-all hover:gap-2.5"
                >
                  Read more <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </CardGrid>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-flag-yellow px-4 py-2 text-sm font-semibold text-flag-black">
                <Bell className="size-4" /> Latest updates
              </div>
              <p className="mt-4 text-muted-foreground">
                Subscribe to stay informed about school events, awards, and alumni activities.
              </p>
              {/*
                This was a <button> with no handler — it looked live and did nothing.
                Until there's a mailing list to join, it points at the contact form,
                which reaches the same office.
              */}
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-flag-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-flag-yellow hover:text-flag-black"
              >
                Join newsletter
              </Link>
            </div>

            <div
              id="events"
              className="scroll-mt-24 md:scroll-mt-28 rounded-3xl bg-flag-black p-8 text-white"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-flag-yellow">
                <Calendar className="size-4" /> Calendar
              </div>
              <h3 className="mt-3 font-display text-xl font-bold">
                Visiting days &amp; school events
              </h3>
              <p className="mt-2 text-sm text-white/75">
                Term dates, parents' meetings, galas and cultural evenings — all on one page.
              </p>
              <Link
                to="/media"
                hash="events"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-flag-yellow hover:text-flag-black"
              >
                See what's on <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                  Upcoming Events
                </div>
                <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
                  On the calendar.
                </h2>
              </div>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published events right now.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((ev: UpcomingEvent, i: number) => (
                  <EventCard key={ev.id} event={ev} index={i} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-3 text-flag-black">
                <Calendar className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold">Academic Calendar</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Key term dates, visiting days, mock exams and extra-curricular events for the
                current academic year. Download the booklet or browse the list.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/media"
                  hash="events"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-flag-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-flag-yellow hover:text-flag-black"
                >
                  View full calendar
                </Link>
                <a
                  href="/documents/academic-calendar-2026.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:border-flag-red hover:text-flag-red"
                >
                  Download PDF <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold mb-4">
                This month at a glance
              </div>
              <MiniCalendar events={upcoming} />
            </div>
          </aside>
        </div>
      </Section>

      {/*
        A PREVIEW, not the whole library. This section used to dump all 33+ photos
        into a flat 3-column grid of identical tiles with the alt text printed
        underneath each one, and then — below all of that — offered a "Browse the
        full gallery" button that linked to this same section. There was nothing
        left to browse and nowhere to go, which is exactly why the button felt dead.

        Now: eight photos here as a taste, and the button goes to /gallery, which
        holds the real thing.
      */}
      <Section id="gallery">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">
              Latest highlights
            </div>
            <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
              Events, awards and campus moments.
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-flag-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-flag-red"
          >
            <Image className="size-4" /> Browse the full gallery
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8">
          <GalleryPreview photos={media.slice(0, 8)} />
        </div>
      </Section>
    </>
  );
}

function EventCard({ event, index }: { event: UpcomingEvent; index: number }) {
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

function MiniCalendar({ events }: { events: UpcomingEvent[] }) {
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
