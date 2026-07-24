import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout route for everything under /portal.
 *
 * IMPORTANT: this route must NOT contain an unconditional redirect.
 * Every /portal/* URL matches this route as a parent, so redirecting here
 * would re-trigger this same route on the redirect target — an infinite
 * navigation loop that locks up the browser tab.
 *
 * The "/portal -> login" redirect lives in portal.index.tsx, which only
 * matches the exact /portal path.
 */
export const Route = createFileRoute("/portal")({
  component: () => <Outlet />,
});
