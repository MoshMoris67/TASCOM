import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { ApplyForm } from "@/components/admissions/ApplyForm";
import { CheckCircle2, Download, FileSearch, HelpCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import scienceLab from "@/assets/science-lab.jpg";

export const Route = createFileRoute("/admissions/")({
  head: () => ({
    meta: [
      { title: "Admissions — Talents College Mukono" },
      {
        name: "description",
        content:
          "Apply to Talents College Mukono. Requirements, fees, downloadable forms, FAQs and online inquiry for S.1 and S.5.",
      },
      { property: "og:title", content: "Admissions — Talents College Mukono" },
      {
        property: "og:description",
        content: "Requirements, fees, and online applications for O & A Level entry.",
      },
    ],
  }),
  component: Admissions,
});

const requirements = [
  "Completed application form (available for download below)",
  "Copy of the applicant's birth certificate or National ID",
  "Two recent passport-size photographs",
  "Previous school report cards (PLE / UCE results as applicable)",
  "Letter of recommendation from the previous school",
  "Non-refundable application fee receipt",
];

const fees = [
  { row: "Senior 1 – Senior 4 (O Level)", day: "UGX 850,000", boarding: "UGX 1,350,000" },
  { row: "Senior 5 – Senior 6 (A Level)", day: "UGX 1,000,000", boarding: "UGX 1,500,000" },
  { row: "Requirements & uniforms (once per year)", day: "UGX 250,000", boarding: "UGX 350,000" },
];

const faqs = [
  {
    q: "When can I apply?",
    a: "Applications for the following academic year open every June. Late applications are accepted subject to available places.",
  },
  {
    q: "Do you offer scholarships?",
    a: "Yes — we run a limited merit and needs-based scholarship program each year for outstanding S.1 and S.5 candidates.",
  },
  {
    q: "Is boarding available for both boys and girls?",
    a: "Yes. We operate separate, well-supervised boys' and girls' boarding houses with resident matrons and patrons.",
  },
  {
    q: "How do I pay school fees?",
    a: "Fees can be paid at the school bursar's office, via bank transfer, or through Mobile Money using the numbers issued each term.",
  },
  {
    q: "Can I visit before applying?",
    a: "Absolutely. Book a campus tour any weekday from 9AM to 4PM via our Contact page or WhatsApp.",
  },
];

function Admissions() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      applying_for: String(fd.get("level") ?? "Not specified").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    if (!payload.name || !payload.email || !payload.phone) {
      toast.error("Please complete name, email and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("admission_inquiries").insert(payload);
      if (error) throw error;
      form.reset();
      toast.success(
        "Inquiry received — the admissions office will be in touch within 2 working days.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Admissions 2027"
        title="Begin your journey at Talents College Mukono."
        description="Applications are open for Senior 1 and Senior 5 entry, and mid-year transfers where places are available."
        image={scienceLab}
        imageAlt="Students working in the Talents College science laboratory"
        crumbs={[{ label: "Admissions" }]}
        tone="sky"
        actions={
          <>
            {/*
              Was <a href="/apply">, which threw away the SPA and reloaded the whole
              bundle on the site's single most important click.
            */}
            <Link
              to="/admissions"
              hash="apply"
              className="inline-flex h-11 items-center rounded-full bg-flag-red px-6 font-semibold text-white hover:opacity-90"
            >
              Apply Online →
            </Link>
            <Link
              to="/admissions/check-status"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 font-semibold text-white transition-colors hover:bg-white/20"
            >
              <FileSearch className="size-4" /> Check application status
            </Link>
          </>
        }
      />

      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Requirements
              </div>
              <h2 className="mt-2 font-display font-black text-3xl">What you need to apply.</h2>
              <ul className="mt-6 space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex gap-3 items-start">
                    <CheckCircle2 className="size-5 text-flag-red mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div id="fees" className="scroll-mt-24 md:scroll-mt-28">
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Fees structure — Day & Boarding
              </div>
              <h2 className="mt-2 font-display font-black text-3xl">Termly fees (indicative).</h2>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-flag-black text-white">
                    <tr>
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-left p-4 font-semibold">Day</th>
                      <th className="text-left p-4 font-semibold">Boarding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f, i) => (
                      <tr key={f.row} className={i % 2 ? "bg-muted/40" : ""}>
                        <td className="p-4 font-medium">{f.row}</td>
                        <td className="p-4">{f.day}</td>
                        <td className="p-4">{f.boarding}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Fees are indicative and confirmed on the official offer letter. Payment plans are
                available on request.
              </p>
            </div>

            <div id="apply" className="scroll-mt-24 md:scroll-mt-28">
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Apply online
              </div>
              <h2 className="mt-2 font-display font-black text-3xl">Online application form.</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Complete the form below to submit your application directly. After you send it, you
                will receive a reference number to track your progress.
              </p>
              <div className="mt-6">
                <ApplyForm />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                FAQ
              </div>
              <h2 className="mt-2 font-display font-black text-3xl">Frequently asked questions.</h2>
              <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
                {faqs.map((f) => (
                  <details key={f.q} className="group p-5">
                    <summary className="flex items-center gap-3 cursor-pointer list-none font-semibold">
                      <HelpCircle className="size-5 text-flag-red shrink-0" />
                      <span className="flex-1">{f.q}</span>
                      <span className="text-flag-red group-open:rotate-45 transition-transform text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted-foreground text-sm pl-8">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-flag-black text-white p-6">
              <div className="text-xs uppercase tracking-widest text-flag-yellow font-semibold">
                Application form
              </div>
              <h3 className="mt-2 font-display font-bold text-xl">Download &amp; print</h3>
              <p className="mt-2 text-sm text-white/80">
                Fill out the form and submit it with the required documents to the admissions
                office.
              </p>
              {/*
                Both of these were href="#" — they looked like downloads and went nowhere.
                They now point at real files under public/documents/. See the README in
                that folder: drop the two PDFs in with these exact filenames.
              */}
              <a
                href="/documents/talents-college-application-form.pdf"
                download
                className="mt-5 inline-flex w-full items-center justify-center gap-2 h-11 rounded-full bg-flag-yellow text-flag-black font-semibold hover:opacity-90"
              >
                <Download className="size-4" /> Application form (PDF)
              </a>
              <a
                href="/documents/talents-college-prospectus.pdf"
                download
                className="mt-3 inline-flex w-full items-center justify-center gap-2 h-11 rounded-full bg-white/10 border border-white/20 font-semibold hover:bg-white/20"
              >
                <Download className="size-4" /> Prospectus (PDF)
              </a>
              <p className="mt-4 text-center text-xs text-white/60">
                Rather not print?{" "}
                <Link
                  to="/admissions"
                  hash="apply"
                  className="font-semibold text-flag-yellow underline-offset-4 hover:underline"
                >
                  Apply online instead
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                Already applied?
              </div>
              <h3 className="mt-2 font-display font-bold text-xl">Track your application</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the reference number from your confirmation page to see whether your application
                is submitted, under review, or decided.
              </p>
              <Link
                to="/admissions/check-status"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-flag-red font-semibold text-white hover:opacity-90"
              >
                <FileSearch className="size-4" /> Check status
              </Link>
            </div>

            <form
              onSubmit={onSubmit}
              className="rounded-2xl bg-card border border-border p-6 space-y-4"
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">
                  Online inquiry
                </div>
                <h3 className="mt-2 font-display font-bold text-xl">Ask a question</h3>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Parent / guardian name</span>
                <input
                  required
                  name="name"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Phone</span>
                <input
                  required
                  name="phone"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Applying for</span>
                <select
                  name="level"
                  className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                >
                  <option>Senior 1 (O Level)</option>
                  <option>Senior 5 (A Level)</option>
                  <option>Mid-year transfer</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Message</span>
                <textarea
                  name="message"
                  rows={4}
                  className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-flag-red text-white font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  "Sending…"
                ) : (
                  <>
                    Send inquiry <Send className="size-4" />
                  </>
                )}
              </button>
            </form>
          </aside>
        </div>
      </Section>
    </>
  );
}
