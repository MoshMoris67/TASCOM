import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /apply was folded into /admissions. The application form now lives on the
 * admissions page at the `#apply` anchor, so deep links and old bookmarks land
 * there instead of a dead-end route. Redirect at the router before anything renders.
 */
export const Route = createFileRoute("/apply/")({
  beforeLoad: () => {
    throw redirect({ to: "/admissions", hash: "apply", replace: true });
  },
});
