import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /staff was folded into /about. The staff directory and principles now live on
 * the about page at the `#staff` anchor, so deep links and old bookmarks land
 * there instead of a dead-end route. Redirect at the router before anything renders.
 */
export const Route = createFileRoute("/staff")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "staff", replace: true });
  },
});
