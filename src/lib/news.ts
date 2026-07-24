import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * One source of truth for news.
 *
 * `admin.news` has been writing full articles into the `news` table — title, slug, tag,
 * excerpt, body, cover_url — since the admin was built. Nothing public ever read them:
 * /media rendered three hard-coded posts, and `body` had no page to render on at all.
 * So an admin could write an article and no visitor could ever open it.
 *
 * The three posts that were hard-coded in media.tsx are kept below, verbatim, as the
 * fallback. They still show if the table is empty or unreachable, so the page never
 * renders as a blank shell — but the moment a real row is published it takes over.
 */

export type NewsPost = {
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  published_at: string;
};

/** The original media.tsx posts, unchanged in wording — now addressable and readable. */
export const fallbackPosts: NewsPost[] = [
  {
    slug: "term-2-opening-26-july-reporting-arrangements",
    title: "Term 2 opening: 26 July — reporting arrangements",
    tag: "Announcement",
    excerpt:
      "Boarders report from 2PM on Sunday. Day scholars begin on Monday. See the timetable for arrival and parents' meeting.",
    body: "Boarders report from 2PM on Sunday. Day scholars begin on Monday. See the timetable for arrival and parents' meeting.",
    cover_url: null,
    published_at: "2026-07-01",
  },
  {
    slug: "science-fair-three-innovations-shortlisted",
    title: "Science fair: three innovations shortlisted",
    tag: "Achievement",
    excerpt:
      "Our Senior 5 solar-water purifier team advances to the national round of the Young Scientists Uganda challenge.",
    body: "Our Senior 5 solar-water purifier team advances to the national round of the Young Scientists Uganda challenge.",
    cover_url: null,
    published_at: "2026-06-14",
  },
  {
    slug: "alumni-vs-students-gala-this-saturday",
    title: "Alumni vs Students gala this Saturday",
    tag: "Event",
    excerpt: "Football, netball and athletics from 9AM. Everyone is welcome — bring the family.",
    body: "Football, netball and athletics from 9AM. Everyone is welcome — bring the family.",
    cover_url: null,
    published_at: "2026-06-02",
  },
];

/**
 * Published posts, newest first. Falls back to the seed set rather than throwing —
 * a news feed is not worth taking a page down over.
 */
export async function fetchNews(limit?: number): Promise<NewsPost[]> {
  try {
    let query = supabase
      .from("news")
      .select("slug,title,tag,excerpt,body,cover_url,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error || !data || data.length === 0)
      return limit ? fallbackPosts.slice(0, limit) : fallbackPosts;
    return data as NewsPost[];
  } catch {
    return limit ? fallbackPosts.slice(0, limit) : fallbackPosts;
  }
}

/** A single post by slug, or null. Checks the seed set too, so old links keep resolving. */
export async function fetchPost(slug: string): Promise<NewsPost | null> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("slug,title,tag,excerpt,body,cover_url,published_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (!error && data) return data as NewsPost;
  } catch {
    // fall through to the seed set
  }
  return fallbackPosts.find((p) => p.slug === slug) ?? null;
}

export const fetchLatestPost = createServerFn().handler(async () => {
  const posts = await fetchNews(1);
  return posts[0] ?? null;
});

export const fetchLatestNews = createServerFn().handler(async () => {
  return await fetchNews(5);
});

/**
 * The rotation feed for the on-site notifier.
 *
 * Deliberately returns the whole recent set rather than just the newest one:
 * the notifier cycles through these in order, so it needs every item, not a
 * single "latest". Capped at 20 so an old archive can't turn into an endless
 * carousel.
 */
export const fetchNewsFeed = createServerFn().handler(async () => {
  return await fetchNews(20);
});
