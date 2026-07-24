import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/layout/PageHero";
import { Loader2 } from "lucide-react";
import { photos } from "@/lib/photos";
import { loginStudent } from "@/lib/student-auth";
import { getStudentToken, setStudentToken } from "@/lib/student-session";

/**
 * NOTE ON THE FILENAME: `portal.student_.login.tsx`
 *
 * The trailing underscore on `student_` opts this route OUT of nesting under
 * `/portal/student` while keeping the URL `/portal/student/login`.
 *
 * This matters: `/portal/student` is a guarded route that redirects logged-out
 * visitors here. If this login page were a *child* of that guarded route, the
 * guard would run on the login page too and redirect to itself forever.
 * The login page must always live OUTSIDE the guard it redirects out of.
 */
export const Route = createFileRoute("/portal/student_/login")({
  ssr: false,
  beforeLoad: () => {
    if (getStudentToken()) throw redirect({ to: "/portal/student" });
  },
  head: () => ({
    meta: [
      { title: "Student Portal — Talents College Mukono" },
      {
        name: "description",
        content: "Sign in to access your academic results, assignments and reports.",
      },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await loginStudent({
        data: { studentId: studentId.trim(), password },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStudentToken(result.token);
      toast.success("Welcome back!");
      // `replace` keeps the login page out of history, so the browser Back
      // button doesn't bounce the user through the auth guard again.
      navigate({ to: "/portal/student", replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Student Portal"
        title="Welcome to your Student Portal"
        description="Sign in with your Student ID to view results, assignments and reports."
        crumbs={[{ label: "Student Portal" }]}
        tone="ink"
      />
      <section className="relative overflow-hidden min-h-screen -mb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photos.heroCampus})` }}
        />
        <div className="absolute inset-0 bg-slate-950/75 dark:bg-slate-950/80" />
        <div className="relative container-page py-16 md:py-24">
          <div className="max-w-md mx-auto rounded-3xl border border-border bg-card/95 p-8 shadow-elegant">
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium">
                  Student ID / Number
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  required
                  autoComplete="username"
                  autoCapitalize="characters"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. TCM00000001"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-full bg-flag-red text-white font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </button>
            </form>
            <p className="mt-6 text-xs text-muted-foreground text-center">
              Need help?{" "}
              <a href="tel:+256703933118" className="text-flag-red font-semibold">
                Call the office
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
