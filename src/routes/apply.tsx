import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * LAYOUT ROUTE for /apply — renders an <Outlet /> only.
 *
 * Same bug as news.tsx, with worse consequences: this file redirected in
 * beforeLoad, and /apply/success is its child, so the confirmation page carrying
 * the applicant's reference number was unreachable. Anyone who submitted an
 * application was redirected to /admissions and never shown their reference.
 *
 * apply.index.tsx owns the /apply redirect. This file owns nothing but the outlet.
 */
export const Route = createFileRoute("/apply")({
  component: () => <Outlet />,
});
