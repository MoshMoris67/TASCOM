import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { CheckCircle2, Copy, FileSearch, Home } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/apply/success")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Application submitted — Talents College Mukono" },
      { name: "description", content: "Your application to Talents College Mukono has been received." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Success,
});

function Success() {
  const { ref } = Route.useSearch();

  const copy = () => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    toast.success("Reference copied");
  };

  return (
    <>
      <PageHero
        eyebrow="Application received"
        title="Thank you — we've got your application."
        description="The admissions office will review your submission and get back to you within 3–5 working days."
        crumbs={[{ label: "Admissions", to: "/admissions" }, { label: "Application received" }]}
        tone="sky"
      />
      <Section>
        <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
          <div className="size-16 mx-auto rounded-full bg-flag-red/10 grid place-items-center">
            <CheckCircle2 className="size-9 text-flag-red" />
          </div>
          <h2 className="mt-6 font-display font-black text-2xl">Submission successful</h2>
          {ref ? (
            <>
              <p className="mt-2 text-muted-foreground">
                Keep this reference number safe — you'll need it to check your status or follow up with the admissions office.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-5 py-3 font-mono text-lg font-semibold">
                {ref}
                <button
                  onClick={copy}
                  aria-label="Copy reference number"
                  className="size-8 grid place-items-center rounded-full hover:bg-background"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Your application has been received. Quote the applicant's full name when following up with the
              admissions office and they will find your file.
            </p>
          )}
          <div className="mt-8 rounded-2xl bg-muted/60 p-5 text-sm text-left">
            <div className="font-semibold">What happens next</div>
            <ol className="mt-2 space-y-1 list-decimal list-inside text-muted-foreground">
              <li>The admissions office reviews your submission and documents.</li>
              <li>You'll be contacted on the phone and email you provided.</li>
              <li>Shortlisted applicants are invited for an interview or entry assessment.</li>
              <li>Offer letters are issued after final review.</li>
            </ol>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/admissions/check-status"
              search={ref ? { ref } : {}}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-flag-red px-5 font-semibold text-white hover:opacity-90"
            >
              <FileSearch className="size-4" /> Check status
            </Link>
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 font-semibold transition-colors hover:border-flag-red hover:text-flag-red"
            >
              <Home className="size-4" /> Back to home
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
