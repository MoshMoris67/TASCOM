import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Calendar, FileText, Image as ImageIcon, LogOut, Users, ShieldAlert, Mail, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import badge from "@/assets/badge.png";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/admin/news", label: "News", icon: FileText },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/applications", label: "Applications", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageCircleQuestion },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      if (!u.user) return setIsAdmin(false);
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  if (isAdmin === null) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-20">
        <div className="max-w-lg mx-auto rounded-3xl border border-border p-8 text-center bg-card">
          <ShieldAlert className="size-10 text-flag-red mx-auto" />
          <h1 className="mt-4 font-display font-bold text-2xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as <strong>{email}</strong>, but this account doesn't have admin
            privileges yet. Ask an existing administrator to grant you the <code>admin</code> role
            in the backend (table <code>user_roles</code>).
          </p>
          <button onClick={signOut} className="mt-6 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flag-red text-white font-semibold text-sm">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <img src={badge} alt="" className="size-10 object-contain" />
              <div className="text-sm">
                <div className="font-display font-bold">Admin</div>
                <div className="text-xs text-muted-foreground truncate max-w-[130px]">{email}</div>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {links.map((l) => {
                const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
                return (
                  <Link key={l.to} to={l.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-flag-red text-white" : "hover:bg-muted"
                    }`}>
                    <l.icon className="size-4" /> {l.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={signOut} className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
