import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /news was folded into /media. It was left as a dead-end page with a plain <a>,
 * which cost a full page load and left a stale URL in search results. Redirect at
 * the router instead, before anything renders.
 */
export const Route = createFileRoute("/news/")({
  beforeLoad: () => {
    throw redirect({ to: "/media", hash: "news", replace: true });
  },
});
