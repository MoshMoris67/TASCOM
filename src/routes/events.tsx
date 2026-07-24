import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /events was folded into Student Life. The listing lives at
 * /student-life#events, inside the News & Events section. Redirect at the
 * router before anything renders.
 */
export const Route = createFileRoute("/events")({
  beforeLoad: () => {
    throw redirect({ to: "/student-life", hash: "events", replace: true });
  },
});
