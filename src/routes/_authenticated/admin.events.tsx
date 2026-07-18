import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: EventsAdmin,
});

type EventRow = {
  id: string; title: string; description: string; location: string | null;
  starts_at: string; ends_at: string | null; published: boolean;
};

const empty: Partial<EventRow> = { title: "", description: "", location: "", starts_at: "", published: true };

function EventsAdmin() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
    setRows((data as EventRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title || !editing.starts_at) return toast.error("Title and start date required");
    const payload = {
      ...editing,
      ends_at: editing.ends_at || null,
      location: editing.location || null,
    };
    const { error } = editing.id
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload as EventRow);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const toLocalInput = (iso: string) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl">Events</h1>
          <p className="text-muted-foreground mt-1">Manage school events.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-flag-red text-white font-semibold text-sm">
          <Plus className="size-4" /> New event
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No events yet.</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]"><thead className="bg-muted"><tr>
            <th className="text-left p-3">Title</th><th className="text-left p-3">Starts</th>
            <th className="text-left p-3">Location</th><th className="p-3 w-24"></th>
          </tr></thead><tbody>{rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-medium">{r.title}</td>
              <td className="p-3 text-muted-foreground">{new Date(r.starts_at).toLocaleString()}</td>
              <td className="p-3 text-muted-foreground">{r.location ?? "—"}</td>
              <td className="p-3 flex gap-1">
                <button onClick={() => setEditing(r)} className="size-8 grid place-items-center rounded hover:bg-muted"><Pencil className="size-4" /></button>
                <button onClick={() => remove(r.id)} className="size-8 grid place-items-center rounded hover:bg-muted text-flag-red"><Trash2 className="size-4" /></button>
              </td>
            </tr>
          ))}</tbody></table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display font-bold text-xl">{editing.id ? "Edit event" : "New event"}</h2>
              <button onClick={() => setEditing(null)} className="size-8 grid place-items-center rounded hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <F label="Title"><input className="i" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></F>
              <F label="Description"><textarea rows={4} className="i" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></F>
              <F label="Location"><input className="i" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></F>
              <div className="grid grid-cols-2 gap-4">
                <F label="Starts at"><input type="datetime-local" className="i" value={toLocalInput(editing.starts_at ?? "")} onChange={(e) => setEditing({ ...editing, starts_at: new Date(e.target.value).toISOString() })} /></F>
                <F label="Ends at (optional)"><input type="datetime-local" className="i" value={toLocalInput(editing.ends_at ?? "")} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></F>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published
              </label>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="h-10 px-4 rounded-full border border-border font-semibold text-sm">Cancel</button>
              <button onClick={save} className="h-10 px-5 rounded-full bg-flag-red text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.i{width:100%;padding:.55rem .75rem;border:1px solid hsl(var(--border));border-radius:.5rem;background:hsl(var(--background));outline:none}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1.5">{children}</div></label>;
}
