import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: NewsAdmin,
});

type NewsRow = {
  id: string; title: string; slug: string; tag: string;
  excerpt: string; body: string; cover_url: string | null;
  published: boolean; published_at: string;
};

const empty: Partial<NewsRow> = {
  title: "", slug: "", tag: "Announcement", excerpt: "", body: "", cover_url: "", published: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

function NewsAdmin() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [editing, setEditing] = useState<Partial<NewsRow> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    setRows((data as NewsRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title) return toast.error("Title is required");
    const slug = editing.slug || slugify(editing.title);
    const payload = { ...editing, slug };
    const { error } = editing.id
      ? await supabase.from("news").update(payload).eq("id", editing.id)
      : await supabase.from("news").insert(payload as NewsRow);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this news post?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl">News</h1>
          <p className="text-muted-foreground mt-1">Create, edit and publish news posts.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-flag-red text-white font-semibold text-sm">
          <Plus className="size-4" /> New post
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts yet — create your first one.</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted"><tr>
              <th className="text-left p-3">Title</th><th className="text-left p-3">Tag</th>
              <th className="text-left p-3">Published</th><th className="p-3 w-24"></th>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.title}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{r.tag}</span></td>
                <td className="p-3 text-muted-foreground">{r.published ? new Date(r.published_at).toLocaleDateString() : "Draft"}</td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => setEditing(r)} className="size-8 grid place-items-center rounded hover:bg-muted"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(r.id)} className="size-8 grid place-items-center rounded hover:bg-muted text-flag-red"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
              <h2 className="font-display font-bold text-xl">{editing.id ? "Edit post" : "New post"}</h2>
              <button onClick={() => setEditing(null)} className="size-8 grid place-items-center rounded hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Title"><input className="input" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="Slug (auto)"><input className="input" value={editing.slug ?? ""} placeholder={editing.title ? slugify(editing.title) : ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Tag"><select className="input" value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })}>
                <option>Announcement</option><option>Achievement</option><option>Event</option><option>Notice</option>
              </select></Field>
              <Field label="Cover image URL"><input className="input" value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} /></Field>
              <Field label="Excerpt"><textarea rows={2} className="input" value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
              <Field label="Body"><textarea rows={8} className="input" value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published (visible on public site)
              </label>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-background">
              <button onClick={() => setEditing(null)} className="h-10 px-4 rounded-full border border-border font-semibold text-sm">Cancel</button>
              <button onClick={save} className="h-10 px-5 rounded-full bg-flag-red text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;padding:.55rem .75rem;border:1px solid hsl(var(--border));border-radius:.5rem;background:hsl(var(--background));outline:none}.input:focus{box-shadow:0 0 0 2px hsl(var(--ring))}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1.5">{children}</div></label>;
}
