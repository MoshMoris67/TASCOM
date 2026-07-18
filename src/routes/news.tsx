import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * LAYOUT ROUTE for /news — it must render an <Outlet /> and nothing else.
 *
 * This file used to `throw redirect({ to: "/media" })` in beforeLoad. Because
 * TanStack runs a parent's beforeLoad before any child's, that redirect fired on
 * /news/$slug too: every "Read more" link in the site bounced straight back to
 * /media#news. The article page existed and was never once reachable.
 *
 * The redirect for the bare /news URL belongs to news.index.tsx, which owns that
 * path and already does it. A parent must not redirect on behalf of its children.
 */
export const Route = createFileRoute("/news")({
  component: () => <Outlet />,
});
