"use client";

import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { fetchNewsFeed, type NewsPost } from "@/lib/news";

/**
 * Rotating news notifier.
 *
 * Every ROTATE_MS it surfaces the next post in the feed, one after the other,
 * and wraps back to the start when it reaches the end. On each tick it also
 * re-reads the feed, so a post published while someone is on the page joins the
 * rotation — and jumps the queue once, announced as new, before falling back
 * into normal order.
 *
 * The previous version showed a single toast the first time it ever ran and
 * then wrote the slug to localStorage, which permanently suppressed it. That is
 * why nothing was appearing: after one page view the key was set and every
 * later visit short-circuited. The seen-set below is only used to decide what
 * counts as *new*, never to stop the rotation.
 */

const ROTATE_MS = 2 * 60 * 1000;
/** Let the page settle before the first toast rather than firing during load. */
const FIRST_DELAY_MS = 8 * 1000;
const SEEN_KEY = "tascom-news-seen";

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Private mode / quota — the rotation still works, new posts just lose
    // their "Just published" label across reloads.
  }
}

export function NewsNotifier() {
  const loadFeed = useServerFn(fetchNewsFeed);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let firstTimer: ReturnType<typeof setTimeout> | undefined;

    let queue: NewsPost[] = [];
    let cursor = 0;
    let seen = readSeen();
    /** Posts that appeared since the last tick — shown ahead of the rotation. */
    let pending: NewsPost[] = [];

    const show = (post: NewsPost, isNew: boolean) => {
      toast(post.title, {
        description: isNew ? `Just published — ${post.excerpt}` : post.excerpt,
        action: {
          label: "Read",
          onClick: () => {
            window.location.href = `/news/${post.slug}`;
          },
        },
        duration: isNew ? 10000 : 7000,
      });
    };

    const refresh = async () => {
      const posts = await loadFeed();
      if (cancelled || !Array.isArray(posts) || posts.length === 0) return;

      const firstRun = seen.size === 0;
      const fresh = posts.filter((p) => !seen.has(p.slug));

      // On a brand-new browser every post looks "fresh"; don't announce the
      // whole archive as breaking news. Just prime the set and rotate normally.
      if (!firstRun && fresh.length > 0) {
        pending.push(...fresh);
      }

      posts.forEach((p) => seen.add(p.slug));
      writeSeen(seen);

      // Keep the cursor pointing at the same post across refreshes where we
      // can, so adding an item doesn't restart the cycle from the top.
      const current = queue[cursor]?.slug;
      queue = posts;
      if (current) {
        const found = queue.findIndex((p) => p.slug === current);
        cursor = found === -1 ? 0 : found;
      }
      if (cursor >= queue.length) cursor = 0;
    };

    const tick = async () => {
      if (cancelled) return;
      // Toasts stacking up behind a hidden tab helps nobody; hold position and
      // resume on the next tick after they come back.
      if (document.visibilityState === "hidden") return;

      try {
        await refresh();
      } catch {
        // Offline or a server hiccup — fall through and rotate what we have.
      }
      if (cancelled) return;

      const next = pending.shift();
      if (next) {
        show(next, true);
        return;
      }

      if (queue.length === 0) return;
      show(queue[cursor], false);
      cursor = (cursor + 1) % queue.length;
    };

    firstTimer = setTimeout(() => {
      void tick();
      interval = setInterval(() => void tick(), ROTATE_MS);
    }, FIRST_DELAY_MS);

    return () => {
      cancelled = true;
      if (firstTimer) clearTimeout(firstTimer);
      if (interval) clearInterval(interval);
    };
  }, [loadFeed]);

  return null;
}
