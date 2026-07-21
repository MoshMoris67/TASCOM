import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CardGrid } from "@/components/motion";
import { Calendar, Bell, Image, Video, ArrowRight } from "lucide-react";
import { photos } from "@/lib/photos";
import { GalleryPreview } from "@/components/gallery/Gallery";
import { fetchNews } from "@/lib/news";
import { fetchMedia } from "@/lib/media";

export const Route = createFileRoute("/media")({
  // News now comes from the `news` table that admin.news has always written to. If the
  // table is empty or unreachable, fetchNews hands back the three seed posts that used
  // to be hard-coded here — so this section never renders empty.
  loader: async () => ({ posts: await fetchNews(6), media: await fetchMedia() }),
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
  const { posts, media } = Route.useLoaderData();

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
              <div
                key={card.label}
                className="rounded-3xl border border-border bg-card p-8"
              >
                {inner}
              </div>
            );
          })}
        </CardGrid>
      </Section>

      <Section id="news">
        <div className="grid gap-10 lg:grid-cols-3">
          <CardGrid className="lg:col-span-2 space-y-6">
            {posts.map((post) => (
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
