import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CardGrid } from "@/components/motion";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Cpu,
  ExternalLink,
  Image,
  Music,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import sports from "@/assets/sports.jpg";
import culture from "@/assets/culture.jpg";
import scienceLab from "@/assets/science-lab.jpg";
import classroom from "@/assets/classroom.jpg";
import { photos } from "@/lib/photos";
import { GalleryPreview } from "@/components/gallery/Gallery";
import { VideoGrid } from "@/components/media/VideoGrid";
import { EventCard, MiniCalendar } from "@/components/events/EventsCalendar";
import { fetchNews, type NewsPost } from "@/lib/news";
import { fetchMedia, fetchVideos } from "@/lib/media";
import { fetchUpcomingEvents, type UpcomingEvent } from "@/lib/events";

/**
 * Student Life absorbed the old /media page.
 *
 * Section order matches the navigation: clubs, sports, news & events, gallery.
 * The events calendar is no longer a destination of its own -- it sits inside
 * the news section but keeps its `#events` anchor, so every link that pointed
 * at `/media#events` still lands in the right place after the redirect.
 */
export const Route = createFileRoute("/student-life")({
  loader: async () => ({
    posts: await fetchNews(6),
    media: await fetchMedia(),
    upcoming: await fetchUpcomingEvents(10),
    videos: await fetchVideos(),
  }),
  head: () => ({
    meta: [
      { title: "Student Life \u2014 Talents College Mukono" },
      {
        name: "description",
        content:
          "Clubs, sports, music dance & drama, ICT, library, student leadership, school news, events, photo gallery and videos from Talents College, Mukono.",
      },
      { property: "og:title", content: "Student Life \u2014 Talents College Mukono" },
      {
        property: "og:description",
        content:
          "Clubs, sports, arts, leadership, news, events, gallery and videos at Talents College Mukono.",
      },
      { property: "og:image", content: photos.campusAvenue },
    ],
  }),
  component: StudentLife,
});

const facilities = [
  {
    icon: Trophy,
    title: "Sports",
    body: "Football, netball, volleyball, basketball, athletics and swimming — competitive and recreational.",
    img: sports,
  },
  {
    icon: Music,
    title: "Music, Dance & Drama",
    body: "Choir, traditional dance troupes, drama club and an annual MDD festival that draws the whole community.",
    img: culture,
  },
  {
    icon: Cpu,
    title: "ICT Lab",
    body: "Modern computer lab with high-speed internet supporting the ICT curriculum and coding club.",
    img: scienceLab,
  },
  {
    icon: BookOpen,
    title: "Library",
    body: "A well-stocked library with study zones, reference materials and digital learning resources.",
    img: classroom,
  },
];

const clubs = [
  "Debate & Public Speaking",
  "Wildlife & Environment",
  "Journalism & Media",
  "Chess",
  "Robotics & Coding",
  "Entrepreneurship",
  "Red Cross",
  "Scripture Union",
  "Interact / Rotary",
  "Peer Counsellors",
  "Photography",
  "Culinary Arts",
];

const leadership = [
  "Head Prefect & Deputy",
  "Academic Prefects",
  "Games & Sports Prefects",
  "Dining Hall & Hospitality",
  "Chapel & Welfare",
  "Time Keepers & Health",
];

/**
 * The three shortcut cards carried over from the media page. All three now
 * point somewhere -- Videos used to be a dead card reading "Coming soon"
 * because nothing on the public site read the video rows the admin form has
 * always written.
 */
const shortcuts = [
  {
    label: "Events",
    icon: Calendar,
    description: "Term dates, parents' meetings, galas and cultural evenings \u2014 all on one page.",
    hash: "events" as const,
  },
  {
    label: "Gallery",
    icon: Image,
    description: "Photo highlights from campus life and school events.",
    hash: "gallery" as const,
  },
  {
    label: "Videos",
    icon: Video,
    description: "Watch Talents College in motion through our video stories.",
    hash: "videos" as const,
  },
];

function StudentLife() {
  const { posts, media, upcoming, videos } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Student life"
        title="Beyond the classroom, the whole student grows."
        description="At Talents College Mukono we take pride in the range of things our students do outside the timetable — because character, confidence and community are shaped there."
        image={sports}
        imageAlt="Student athletes competing on the Talents College sports field"
        crumbs={[{ label: "Student Life" }]}
        layout="feature"
      />

      <Section id="clubs">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
              Clubs & societies
            </div>
            <h2 className="mt-2 font-display font-black text-3xl">A club for every passion.</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Every student joins at least one club. It's where friendships form and talents are
              discovered — often the memory a graduate carries longest.
            </p>
            <CardGrid className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3" stagger={45}>
              {clubs.map((c) => (
                <div
                  key={c}
                  className="p-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-flag-yellow hover:text-flag-black hover:border-flag-yellow transition-colors"
                >
                  {c}
                </div>
              ))}
            </CardGrid>
          </div>

          <aside className="rounded-3xl p-8 bg-flag-black text-white h-fit">
            <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
              Student leadership
            </div>
            <h3 className="mt-2 font-display font-bold text-2xl">Led by students, for students.</h3>
            <p className="mt-3 text-white/80 text-sm">
              Our prefect body is elected each year and represents the student voice in school
              governance.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {leadership.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <Users className="size-4 text-flag-yellow" />
                  {r}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section id="sports" className="!pt-0">
        <CardGrid className="grid gap-6 md:grid-cols-2" tilt tiltMax={6}>
          {facilities.map((f) => (
            <div key={f.title} className="group relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={f.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-flag-black/95 via-flag-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                <f.icon className="size-6 text-flag-yellow" />
                <h3 className="mt-3 font-display font-black text-2xl">{f.title}</h3>
                <p className="mt-2 text-sm text-white/85 max-w-md">{f.body}</p>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      <Section id="news">
        <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
          News &amp; events
        </div>
        <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
          What&apos;s happening at Talents.
        </h2>

        <CardGrid className="mt-8 grid gap-6 lg:grid-cols-3" tilt>
          {shortcuts.map((card) => (
            <Link
              key={card.label}
              to="/student-life"
              hash={card.hash}
              className="rounded-3xl border border-border bg-card p-8 transition-all hover:border-flag-red"
            >
              <div className="inline-flex items-center justify-center rounded-3xl bg-flag-yellow p-4 text-flag-black">
                <card.icon className="size-6" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">{card.label}</h3>
              <p className="mt-3 text-muted-foreground">{card.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-flag-red">
                Open <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </CardGrid>

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
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
                <h3 className="mt-4 font-display text-2xl font-black">
                  <Link
                    to="/news/$slug"
                    params={{ slug: post.slug }}
                    className="transition-colors hover:text-flag-red"
                  >
                    {post.title}
                  </Link>
                </h3>
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
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-flag-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-flag-yellow hover:text-flag-black"
              >
                Join newsletter
              </Link>
            </div>

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
                  to="/student-life"
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

        {/*
          Keeps the `#events` id the old media page used, so `/media#events`,
          `/events` and every existing link still resolve to the calendar even
          though it is no longer a destination of its own.
        */}
        <div id="events" className="mt-16 scroll-mt-24 md:scroll-mt-28">
          <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
            Upcoming events
          </div>
          <h3 className="mt-2 font-display font-black text-3xl md:text-4xl">On the calendar.</h3>
          <div className="mt-8">
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
        </div>
      </Section>

      {/* A preview, not the whole library — the full set lives at /gallery. */}
      <Section id="gallery" className="!pt-0">
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

      <Section id="videos" className="!pt-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">Videos</div>
        <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
          Talents College in motion.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Assemblies, sports days, MDD festival performances and campus tours.
        </p>
        <div className="mt-8">
          <VideoGrid videos={videos} />
        </div>
      </Section>
    </>
  );
}
