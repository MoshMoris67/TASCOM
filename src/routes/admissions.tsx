import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * LAYOUT ROUTE for /admissions — renders an <Outlet /> only.
 *
 * This file used to be a second, older copy of the whole admissions page: 300
 * lines that duplicated admissions.index.tsx and still carried the two dead
 * `href="#"` download links that the index copy had already fixed. Because it
 * declared a `component` and never rendered an <Outlet />, its children could
 * not appear — so /admissions/check-status showed the admissions page instead
 * of the status checker, and the Footer link to it went nowhere.
 *
 * The page now lives in exactly one file: admissions.index.tsx.
 */
export const Route = createFileRoute("/admissions")({
  component: () => <Outlet />,
});
