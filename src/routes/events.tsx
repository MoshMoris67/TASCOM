import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /events was folded into /media. The events listing now lives on the media
 * page at the `#events` anchor. Redirect at the router before anything renders.
 */
export const Route = createFileRoute("/events")({
  beforeLoad: () => {
    throw redirect({ to: "/media", hash: "events", replace: true });
  },
});
