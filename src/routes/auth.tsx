import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageHero } from "@/components/layout/PageHero";
import { Loader2 } from "lucide-react";
import badge from "@/assets/badge.png";
import { photos } from "@/lib/photos";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Talents College Mukono" },
      { name: "description", content: "Sign in to the Talents College Mukono administrator dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth",
        },
      });
      if (error) throw error;
      if (!data?.url) {
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Staff area"
        title="Sign in to Talents College Mukono."
        description="Administrator access to manage news, events, media and admissions."
        crumbs={[{ label: "Sign in" }]}
        tone="ink"
      />
      <section className="relative overflow-hidden min-h-screen -mb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photos.heroCampus})` }}
        />
        <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/75" />
        <div className="relative container-page py-16 md:py-24">
          <div className="max-w-md mx-auto rounded-3xl border border-border bg-card/95 p-8 shadow-elegant overflow-hidden">
          <img
            src={badge}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 opacity-[0.06] dark:opacity-[0.1] select-none"
          />
          <div className="relative flex gap-2 p-1 bg-muted rounded-full mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${
                  mode === m ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="w-full h-11 rounded-full border border-border bg-background hover:bg-muted font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <svg viewBox="0 0 48 48" className="size-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-flag-red outline-none" />
            </label>
            <div className="flex justify-center">
              <button type="submit" disabled={busy}
                className="h-11 px-12 rounded-full bg-flag-red text-white font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {busy && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Looking for the school site? <Link to="/" className="text-flag-red font-semibold">Return home</Link>.
          </p>
          </div>
        </div>
      </section>
    </>
  );
}
