import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { PageHero, Section } from "@/components/layout/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { school } from "@/lib/school-info";
import { photos } from "@/lib/photos";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  FileSearch,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  XCircle,
} from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/admissions/check-status")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Check application status — Talents College Mukono" },
      {
        name: "description",
        content:
          "Track a Talents College Mukono admission application using the reference number issued when it was submitted.",
      },
      { property: "og:title", content: "Check application status — Talents College Mukono" },
      {
        property: "og:description",
        content: "Enter your reference number to see where your application stands.",
      },
    ],
  }),
  component: CheckStatus,
});

type Result =
  | { found: false }
  | {
      found: true;
      reference: string;
      student_name: string;
      level: string;
      status: string;
      submitted_at: string;
      updated_at: string;
    };

/**
 * The four values admin.applications writes to `applications.status`, translated into
 * something a parent can act on. Anything unrecognised falls back to `submitted` rather
 * than rendering a blank card.
 */
const stages = [
  {
    key: "submitted",
    label: "Submitted",
    blurb: "We have your application and your documents are queued for review.",
    Icon: Clock,
    className: "bg-flag-blue/10 text-flag-blue border-flag-blue/30",
  },
  {
    key: "reviewing",
    label: "Under review",
    blurb: "The admissions office is going through the application. Keep your phone on.",
    Icon: FileSearch,
    className: "bg-flag-yellow/20 text-flag-black border-flag-yellow",
  },
  {
    key: "accepted",
    label: "Accepted",
    blurb:
      "Congratulations. The office will contact you about the offer letter and reporting details.",
    Icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
  {
    key: "rejected",
    label: "Not successful",
    blurb:
      "This application wasn't successful this intake. Please call the office — they can talk through options.",
    Icon: XCircle,
    className: "bg-flag-red/10 text-flag-red border-flag-red/30",
  },
] as const;

const stageFor = (status: string) => stages.find((s) => s.key === status) ?? stages[0];
const stageIndex = (status: string) =>
  Math.max(
    0,
    stages.findIndex((s) => s.key === status),
  );

function CheckStatus() {
  const { ref: prefill } = Route.useSearch();
  const [reference, setReference] = useState(prefill ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Same single-flight guard the apply form uses: a double-tap on a slow connection
  // shouldn't fire two lookups.
  const inFlight = useRef(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: rpcError } = await supabase.rpc("check_application_status", {
      p_reference: reference,
      p_phone: phone,
    });

    setLoading(false);
    inFlight.current = false;

    if (rpcError) {
      // If the migration hasn't been pushed yet the function simply doesn't exist.
      const missing = /check_application_status|function .* does not exist|PGRST202/i.test(
        rpcError.message ?? "",
      );
      setError(
        missing
          ? "Status lookup isn't switched on yet. Please call the admissions office and quote your reference."
          : rpcError.message,
      );
      return;
    }

    setResult(data as unknown as Result);
  };

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Check your application status."
        description="Enter the reference number from your confirmation page and the phone number you applied with. Both are needed — it's what keeps other people's applications private."
        image={photos.campusGate}
        imageAlt="The main gate at Talents College Mukono"
        crumbs={[{ label: "Admissions", to: "/admissions" }, { label: "Check status" }]}
        tone="sky"
        layout="split"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <form
              onSubmit={onSubmit}
              className="rounded-3xl border border-border bg-card p-6 md:p-8"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-flag-red">
                Status lookup
              </div>
              <h2 className="mt-2 font-display text-2xl font-black">Find my application</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Reference number</span>
                  <input
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="TCM-1A2B3C4D"
                    autoComplete="off"
                    spellCheck={false}
                    className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-flag-red"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Parent / guardian phone</span>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0773 207 394"
                    inputMode="tel"
                    autoComplete="tel"
                    className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-flag-red"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The phone number as it was typed on the form. Any format works — 0773…, +256 773… or
                256773….
              </p>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-flag-red px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Checking…
                  </>
                ) : (
                  <>
                    <Search className="size-4" /> Check status
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 rounded-2xl border border-flag-red/30 bg-flag-red/5 p-5 text-sm text-flag-red">
                {error}
              </div>
            )}

            {result && !result.found && (
              <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-flag-red" />
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      No application matched those details
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Check the reference for typos — it looks like{" "}
                      <span className="font-mono">TCM-</span> followed by eight characters. The
                      phone number has to be the one entered on the application, which may not be
                      the phone you're reading this on. If both look right, call the office below
                      and they'll find the file by name.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result && result.found && <StatusCard result={result} />}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-flag-black p-6 text-white">
              <h3 className="font-display text-lg font-bold">Lost your reference?</h3>
              <p className="mt-2 text-sm text-white/75">
                The admissions office can look the application up by the applicant's full name and
                date of birth.
              </p>
              <div className="mt-5 space-y-2.5">
                <a
                  href={`tel:${school.contacts.office1.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15"
                >
                  <Phone className="size-4 shrink-0 text-flag-yellow" /> {school.contacts.office1}
                </a>
                <a
                  href={`https://wa.me/${school.contacts.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm transition-colors hover:bg-white/15"
                >
                  <MessageCircle className="size-4 shrink-0 text-flag-yellow" /> WhatsApp admissions
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Haven't applied yet?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The online form takes about ten minutes. You'll get a reference number as soon as
                it's submitted.
              </p>
              <Link
                to="/admissions"
                hash="apply"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-flag-red px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Apply online →
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function StatusCard({ result }: { result: Extract<Result, { found: true }> }) {
  const stage = stageFor(result.status);
  const reached = stageIndex(result.status);
  const rejected = result.status === "rejected";
  // A rejected application never "passes through" accepted, so the rail stops at review.
  const rail = rejected
    ? stages.filter((s) => s.key !== "accepted")
    : stages.filter((s) => s.key !== "rejected");

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Applicant</div>
            <h3 className="mt-1 font-display text-2xl font-black">{result.student_name}</h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {result.level} · submitted {new Date(result.submitted_at).toLocaleDateString()}
            </div>
          </div>
          <div className="rounded-full bg-muted px-4 py-2 font-mono text-sm font-semibold">
            {result.reference}
          </div>
        </div>

        <div className={cn("mt-6 flex items-start gap-3 rounded-2xl border p-4", stage.className)}>
          <stage.Icon className="mt-0.5 size-5 shrink-0" />
          <div>
            <div className="font-display text-lg font-bold">{stage.label}</div>
            <p className="mt-1 text-sm opacity-90">{stage.blurb}</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Progress
        </div>
        <ol className="mt-4 space-y-4">
          {rail.map((s) => {
            const index = stageIndex(s.key);
            const done = index <= reached;
            const current = s.key === stage.key;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    done
                      ? rejected && current
                        ? "border-flag-red bg-flag-red text-white"
                        : "border-flag-red bg-flag-red text-white"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    current ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-xs text-muted-foreground">
          Last updated {new Date(result.updated_at).toLocaleString()}. This page reflects the
          admissions office's own record — it isn't a decision letter. Offers are always confirmed
          in writing.
        </p>
      </div>
    </div>
  );
}
