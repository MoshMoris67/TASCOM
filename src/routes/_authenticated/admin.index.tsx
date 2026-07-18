import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, Image as ImageIcon, Users, Mail, MessageCircleQuestion } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [counts, setCounts] = useState({ news: 0, events: 0, media: 0, applications: 0, messages: 0, inquiries: 0 });

  useEffect(() => {
    (async () => {
      const [n, e, m, a, c, i] = await Promise.all([
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("media").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("admission_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      setCounts({
        news: n.count ?? 0, events: e.count ?? 0, media: m.count ?? 0, applications: a.count ?? 0, messages: c.count ?? 0, inquiries: i.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "News posts", value: counts.news, to: "/admin/news", icon: FileText },
    { label: "Events", value: counts.events, to: "/admin/events", icon: Calendar },
    { label: "Media items", value: counts.media, to: "/admin/media", icon: ImageIcon },
    { label: "Applications", value: counts.applications, to: "/admin/applications", icon: Users },
    { label: "New messages", value: counts.messages, to: "/admin/messages", icon: Mail },
    { label: "New inquiries", value: counts.inquiries, to: "/admin/inquiries", icon: MessageCircleQuestion },
  ];

  return (
    <div>
      <h1 className="font-display font-black text-3xl">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Manage the school website from one place.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}
            className="p-6 rounded-2xl border border-border bg-card hover:border-flag-red hover:shadow-elegant transition-all">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-flag-black text-flag-yellow grid place-items-center">
                <c.icon className="size-5" />
              </div>
              <span className="text-3xl font-display font-black">{c.value}</span>
            </div>
            <div className="mt-4 font-semibold">{c.label}</div>
            <div className="text-xs text-muted-foreground">Manage →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
