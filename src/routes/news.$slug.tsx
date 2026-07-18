import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { fetchPost, fetchNews, type NewsPost } from "@/lib/news";
import { photos } from "@/lib/photos";
import { ArrowLeft, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    if (!post) throw notFound();
    const more = (await fetchNews(4)).filter((p) => p.slug !== post.slug).slice(0, 3);
    return { post, more };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
    return {
      meta: [
        { title: `${post.title} — Talents College Mukono` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        ...(post.cover_url ? [{ property: "og:image", content: post.cover_url }] : []),
      ],
    };
  },
  component: Article,
});

function Article() {
  const { post, more } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow={post.tag}
        title={post.title}
        description={post.excerpt}
        image={post.cover_url ?? photos.campusAvenue}
        imageAlt=""
        crumbs={[{ label: "Media", to: "/media" }, { label: post.tag }]}
        tone="ink"
        layout="banner"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-flag-red" />
              {new Date(post.published_at).toDateString()}
            </div>

            {/*
              `body` is authored as plain text in the admin, so it's rendered as
              paragraphs split on blank lines — never as HTML. Piping admin input
              through dangerouslySetInnerHTML would make the newsroom an XSS surface.
            */}
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              {post.body
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            <Link
              to="/media"
              hash="news"
              className="mt-12 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-flag-red hover:text-flag-red"
            >
              <ArrowLeft className="size-4" /> All news &amp; events
            </Link>
          </article>

          {more.length > 0 && (
            <aside>
              <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">
                More from Talents
              </div>
              <div className="mt-4 space-y-4">
                {more.map((p: NewsPost) => (
                  <Link
                    key={p.slug}
                    to="/news/$slug"
                    params={{ slug: p.slug }}
                    className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-flag-red"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {p.tag}
                    </div>
                    <div className="mt-1.5 font-display font-bold leading-snug">{p.title}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(p.published_at).toDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </Section>
    </>
  );
}
