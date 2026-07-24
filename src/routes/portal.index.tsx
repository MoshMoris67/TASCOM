import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Index route: matches ONLY the exact path "/portal".
 * Safe place for the redirect, because the redirect target
 * (/portal/student/login) does not match this index route.
 */
export const Route = createFileRoute("/portal/")({
  beforeLoad: () => {
    throw redirect({ to: "/portal/student/login" });
  },
});
