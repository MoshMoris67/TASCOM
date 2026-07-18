import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { Bell, Clock, GraduationCap, MessageCircle, Phone, Users } from "lucide-react";
import { school } from "@/lib/school-info";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Student & Parents Portal — Talents College Mukono" },
      {
        name: "description",
        content: "The Talents College Mukono student and parents portal is in development. Here's how to reach the school in the meantime.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

const audiences = [
  {
    icon: GraduationCap,
    title: "Students",
    body: "View timetables, assignments and results once the portal launches.",
  },
  {
    icon: Users,
    title: "Parents & Guardians",
    body: "Track fees, attendance and school communication in one place.",
  },
];

function Portal() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="The student & parents portal is on its way."
        description="We're building a secure online portal for students and parents. It isn't live yet — but our team is still just a call, message or visit away."
        crumbs={[{ label: "Portal" }]}
        tone="ink"
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {audiences.map((a) => (
            <div key={a.title} className="rounded-3xl border border-border bg-card p-8">
              <div className="size-11 rounded-xl bg-flag-yellow/20 grid place-items-center text-flag-red">
                <a.icon className="size-5" />
              </div>
              <h2 className="mt-4 font-display font-bold text-xl">{a.title}</h2>
              <p className="mt-2 text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-flag-black text-white p-8 md:p-10">
          <div className="flex items-start gap-3">
            <Bell className="size-5 text-flag-yellow shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-xl">Want to know when it's ready?</h3>
              <p className="mt-2 text-white/75">
                Follow our <Link to="/media" hash="news" className="underline decoration-flag-yellow underline-offset-4 hover:text-flag-yellow">news &amp; announcements</Link> page or contact the office below — we'll let families know as soon as the portal opens.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a href={`tel:${school.contacts.office1.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15 transition-colors">
              <Phone className="size-4 text-flag-yellow shrink-0" /> {school.contacts.office1}
            </a>
            <a href={`https://wa.me/${school.contacts.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15 transition-colors">
              <MessageCircle className="size-4 text-flag-yellow shrink-0" /> WhatsApp admissions
            </a>
            <Link to="/contact" className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15 transition-colors">
              <Clock className="size-4 text-flag-yellow shrink-0" /> Visit the contact page
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
