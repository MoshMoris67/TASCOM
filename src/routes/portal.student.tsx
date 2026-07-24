import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/layout/PageHero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  GraduationCap,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Printer,
  UserRound,
} from "lucide-react";
import { format } from "date-fns";
import {
  getStudentSession,
  getStudentResults,
  getStudentAssignments,
  logoutStudent,
  type Student,
  type ResultsRow,
  type AssignmentRow,
} from "@/lib/student-auth";
import { getStudentToken, clearStudentToken } from "@/lib/student-session";
import { useServerFn } from "@tanstack/react-start";

/**
 * Guarded dashboard at /portal/student.
 *
 * The login page it redirects to (/portal/student/login) deliberately lives in
 * `portal.student_.login.tsx` — the trailing underscore keeps it OUT of this
 * route's subtree. If it were a child, this guard would run on the login page
 * and redirect it to itself forever, freezing the browser.
 */
export const Route = createFileRoute("/portal/student")({
  ssr: false,
  beforeLoad: () => {
    if (!getStudentToken()) {
      throw redirect({ to: "/portal/student/login", replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Student Dashboard — Talents College Mukono" },
      {
        name: "description",
        content: "Student portal with results, assignments and reports.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const navigate = useNavigate();
  // Read the token ONCE per mount. Reading localStorage during render on every
  // pass makes the value a fresh read each time and turns any effect that
  // depends on it into a potential re-run loop.
  const [token] = useState<string | null>(() => getStudentToken());

  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<ResultsRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const getSessionFn = useServerFn(getStudentSession);
  const getResultsFn = useServerFn(getStudentResults);
  const getAssignmentsFn = useServerFn(getStudentAssignments);

  // Server-fn wrappers are not guaranteed to be referentially stable across
  // renders, so they are held in refs and kept out of effect dependency lists.
  const fns = useRef({ getSessionFn, getResultsFn, getAssignmentsFn });
  fns.current = { getSessionFn, getResultsFn, getAssignmentsFn };

  const signOutLocally = useCallback(() => {
    clearStudentToken();
    navigate({ to: "/portal/student/login", replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/portal/student/login", replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const session = await fns.current.getSessionFn({ data: { token } });
        if (cancelled) return;

        if (!session.ok) {
          toast.error(session.error);
          signOutLocally();
          return;
        }

        setStudent(session.student);
        setLoading(false);

        // Results and assignments load in parallel after the profile is known.
        // A failure here should not knock the user out of the portal.
        const [r, a] = await Promise.all([
          fns.current.getResultsFn({ data: { token } }),
          fns.current.getAssignmentsFn({ data: { token } }),
        ]);
        if (cancelled) return;

        if (r.ok) setResults(r.results);
        else if (r.error) toast.error(r.error);

        if (a.ok) setAssignments(a.assignments);
        else if (a.error) toast.error(a.error);
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "Failed to load your portal.");
        signOutLocally();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally depends only on values that are stable for the lifetime of
    // this mount. Adding the server fns here would re-run the load on every
    // render.
  }, [token, navigate, signOutLocally]);

  const handleLogout = async () => {
    try {
      // The token must be sent: sign-out revokes this specific session row
      // server-side, so the token cannot be replayed afterwards.
      if (token) await logoutStudent({ data: { token } });
    } catch {
      // Local sign-out proceeds regardless.
    }
    signOutLocally();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-flag-red" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <>
      <PageHero
        eyebrow="Student Portal"
        title={`Welcome, ${student.first_name}`}
        description="Check your results, assignments and generate reports."
        crumbs={[{ label: "Student Portal" }, { label: "Dashboard" }]}
        tone="ink"
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col items-center text-center">
              <div className="size-24 rounded-full bg-muted overflow-hidden border-2 border-flag-yellow">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full grid place-items-center text-flag-red">
                    <UserRound className="size-12" />
                  </div>
                )}
              </div>
              <div className="mt-4 font-display font-bold text-lg">
                {student.first_name} {student.last_name}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {student.student_id}
              </div>
              <div className="mt-2 inline-flex rounded-full bg-flag-yellow/10 px-3 py-1 text-xs font-semibold text-flag-black">
                {student.level}
              </div>
              {student.class_stream && (
                <div className="text-xs text-muted-foreground mt-1">
                  {student.class_stream}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-flag-red hover:text-flag-red"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground space-y-3">
              {student.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-flag-yellow mt-0.5" />
                  <span>{student.address}</span>
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-flag-yellow" />
                  <a href={`tel:${student.parent_phone}`} className="hover:text-flag-red">{student.parent_phone}</a>
                </div>
              )}
              {student.parent_email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-flag-yellow" />
                  <a href={`mailto:${student.parent_email}`} className="hover:text-flag-red">{student.parent_email}</a>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="mb-6 w-full sm:w-auto">
                <TabsTrigger value="results" className="gap-2">
                  <GraduationCap className="size-4" /> Results
                </TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="report">
                  <Printer className="size-4" /> Report
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results">
                <ResultsView results={results} />
              </TabsContent>

              <TabsContent value="assignments">
                <AssignmentsView assignments={assignments} />
              </TabsContent>

              <TabsContent value="report">
                <ReportView student={student} results={results} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Section>
    </>
  );
}

function ResultsView({ results }: { results: ResultsRow[] }) {
  if (!results.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <GraduationCap className="size-10 text-flag-red mx-auto" />
        <h3 className="mt-4 font-display font-bold text-xl">No results yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Results will appear here once published by your teachers.</p>
      </div>
    );
  }

  const terms = Array.from(new Set(results.map((r) => `${r.term} ${r.year}`)));

  return (
    <div className="space-y-6">
      {terms.map((term) => {
        const termResults = results.filter((r) => `${r.term} ${r.year}` === term);
        return (
          <div key={term} className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="bg-flag-black px-6 py-3 text-white">
              <div className="font-display font-bold">{term}</div>
            </div>
            <div className="divide-y divide-border">
              {termResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div className="font-medium">{r.subject}</div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums font-semibold">{r.score ?? "-"}</span>
                    <span className="rounded-full bg-flag-yellow/10 px-2 py-0.5 text-xs font-semibold text-flag-black">{r.grade ?? "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignmentsView({ assignments }: { assignments: AssignmentRow[] }) {
  if (!assignments.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <FileText className="size-10 text-flag-red mx-auto" />
        <h3 className="mt-4 font-display font-bold text-xl">No assignments</h3>
        <p className="mt-2 text-sm text-muted-foreground">You have no pending assignments right now.</p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    graded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    late: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="space-y-3">
      {assignments.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.subject}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[a.status] ?? "bg-muted"}`}>
              {a.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Assigned: {a.assigned_date ? format(new Date(a.assigned_date), "PPP") : "-"}</span>
            {a.due_date && <span>Due: {format(new Date(a.due_date), "PPP")}</span>}
          </div>
          {a.feedback && (
            <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
              <div className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Feedback</div>
              <p className="mt-1">{a.feedback}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReportView({ student, results }: { student: Student; results: ResultsRow[] }) {
  const print = () => window.print();

  const terms = Array.from(new Set(results.map((r) => `${r.term} ${r.year}`)));

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-black text-2xl">Academic Report</h3>
        <button
          onClick={print}
          className="inline-flex items-center gap-2 rounded-full bg-flag-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Printer className="size-4" /> Print / Save PDF
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Name</div>
          <div className="font-semibold">{student.first_name} {student.last_name}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Student ID</div>
          <div className="font-semibold">{student.student_id}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Level</div>
          <div className="font-semibold">{student.level}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Class / Stream</div>
          <div className="font-semibold">{student.class_stream ?? "-"}</div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {terms.map((term) => {
          const termResults = results.filter((r) => `${r.term} ${r.year}` === term);
          return (
            <div key={term}>
              <h4 className="font-display font-bold text-lg mb-2">{term}</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Subject</th>
                    <th className="text-right py-2">Score</th>
                    <th className="text-right py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {termResults.map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="py-2">{r.subject}</td>
                      <td className="py-2 text-right tabular-nums">{r.score ?? "-"}</td>
                      <td className="py-2 text-right tabular-nums">{r.grade ?? "-"}</td>
                    </tr>
                  ))}
                  {termResults.length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-center text-muted-foreground">No published results for this term.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
        {terms.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No results published yet.</p>
        )}
      </div>
    </div>
  );
}
