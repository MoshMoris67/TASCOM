import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /media was merged into /student-life.
 *
 * The route is kept rather than deleted so existing links, bookmarks and search
 * results keep working. The old anchors are mapped rather than dropped:
 * `#events` used to be its own destination and now lives inside the news
 * section, so it resolves to the `#events` block within `#news`.
 *
 * The hash is read from `window.location` because a fragment is never sent to
 * the server — on SSR there is nothing to read, so the visitor lands at the top
 * of the page and the client-side hop handles the rest.
 */
const HASH_MAP: Record<string, "news" | "events" | "gallery" | "videos"> = {
  news: "news",
  events: "events",
  gallery: "gallery",
  videos: "videos",
};

export const Route = createFileRoute("/media")({
  beforeLoad: () => {
    const current =
      typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    throw redirect({
      to: "/student-life",
      hash: HASH_MAP[current] ?? "news",
      replace: true,
    });
  },
});
