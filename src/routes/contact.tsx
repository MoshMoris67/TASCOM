import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/PageHero";
import { photos } from "@/lib/photos";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { school } from "@/lib/school-info";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

/**
 * `?subject=` lets other pages hand this form a reason for writing. The alumni
 * "Join the alumni network" button uses it, so someone arriving from there finds
 * the subject already filled in rather than a blank form and no idea what to type.
 */
const searchSchema = z.object({ subject: z.string().optional() });

export const Route = createFileRoute("/contact")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Contact — Talents College Mukono" },
      { name: "description", content: "Reach Talents College Mukono by phone, email, WhatsApp or in person. Location map, contact form and directions." },
      { property: "og:title", content: "Contact — Talents College Mukono" },
      { property: "og:description", content: "Get in touch with the admissions office and school leadership." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { subject } = Route.useSearch();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: subject ?? "", message: "" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      if (error) throw error;

      (e.target as HTMLFormElement).reset();
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent — we'll respond within 2 working days.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your message. Please try again or call/WhatsApp us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const cards = [
    { icon: Phone, label: "Head Teacher", value: school.contacts.headTeacher, href: `tel:${school.contacts.headTeacher.replace(/\s+/g, "")}` },
    { icon: Phone, label: "Office", value: `${school.contacts.office1} · ${school.contacts.office2}`, href: `tel:${school.contacts.office1.replace(/\s+/g, "")}` },
    { icon: Mail, label: "Email", value: school.contacts.email, href: `mailto:${school.contacts.email}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with admissions", href: `https://wa.me/${school.contacts.whatsapp.replace(/\D/g, "")}` },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="We'd love to hear from you."
        description="Call, message, or visit us. The admissions office and reception are open Monday to Saturday, 8AM – 5PM."
        crumbs={[{ label: "Contact" }]}
        image={photos.campusGate}
        imageAlt="The entrance to Talents College Mukono"
        tone="sky"
        layout="split"
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="p-6 rounded-2xl bg-card border border-border hover:border-flag-red hover:-translate-y-1 transition-all">
              <div className="size-11 rounded-xl bg-flag-yellow grid place-items-center">
                <c.icon className="size-5 text-flag-black" />
              </div>
              <div className="mt-4 text-xs uppercase tracking-widest text-flag-red font-semibold">{c.label}</div>
              <div className="mt-1 font-semibold text-sm break-words">{c.value}</div>
            </a>
          ))}
        </div>
      </Section>

      <Section className="!pt-0 grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card border border-border p-8 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-flag-red font-semibold">Send a message</div>
            <h2 className="mt-2 font-display font-black text-3xl">Get in touch.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Your name</span>
              <input
                required
                name="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Subject</span>
            <input
              required
              name="subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Message</span>
            <textarea
              required
              name="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none"
            />
          </label>
          <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flag-red text-white font-semibold hover:opacity-90 disabled:opacity-60">
            {submitting ? "Sending…" : <>Send message <Send className="size-4" /></>}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-elegant border border-border">
            <iframe
              title="Talents College Mukono location on map"
              src="https://www.google.com/maps?q=Talents+College+Mukono,+Nabuti+Village,+Mukono,+Uganda&output=embed"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-3xl p-6 bg-flag-black text-white">
            <div className="flex gap-3">
              <MapPin className="size-5 text-flag-yellow shrink-0 mt-0.5" />
              <div>
                <div className="font-display font-bold text-lg">Our campus</div>
                <div className="text-sm text-white/80 mt-1">{school.address.physical}</div>
                <div className="text-sm text-white/60 mt-1">{school.address.postal}</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

