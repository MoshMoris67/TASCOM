import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, X, Info, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaAdmin,
});

type MediaRow = {
  id: string;
  kind: "photo" | "video";
  title: string;
  category: string;
  url: string;
  thumbnail_url: string | null;
  published: boolean;
};

const empty: Partial<MediaRow> = {
  kind: "photo",
  title: "",
  category: "Campus",
  url: "",
  thumbnail_url: "",
  published: true,
};

function MediaAdmin() {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [editing, setEditing] = useState<Partial<MediaRow> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as MediaRow[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const openEdit = (row?: MediaRow) => {
    setEditing(row ? { ...row } : { ...empty });
    setFile(null);
    setThumbFile(null);
  };

  const uploadToBucket = async (f: File, prefix: string) => {
    const ext = f.name.split(".").pop();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(path, f, { upsert: false, cacheControl: "31536000" });
    if (error) throw error;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!editing) return;
    if (editing.kind === "photo") {
      if (!editing.url && !file)
        return toast.error("Choose an image to upload, or paste an image URL");
    } else if (!editing.url && !file) {
      return toast.error("Paste a video URL (YouTube, etc.) or upload a video file");
    }

    setUploading(true);
    try {
      const payload: Partial<MediaRow> = { ...editing };
      if (file) {
        payload.url = await uploadToBucket(file, editing.kind === "video" ? "videos" : "photos");
      }
      if (editing.kind === "video" && thumbFile) {
        payload.thumbnail_url = await uploadToBucket(thumbFile, "thumbs");
      }
      payload.thumbnail_url = payload.thumbnail_url || null;

      const { error } = editing.id
        ? await supabase.from("media").update(payload).eq("id", editing.id)
        : await supabase.from("media").insert(payload as MediaRow);
      if (error) return toast.error(error.message);
      toast.success("Saved");
      setEditing(null);
      setFile(null);
      setThumbFile(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    await supabase.from("media").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl">Media library</h1>
          <p className="text-muted-foreground mt-1">Add photos and videos to the public gallery.</p>
        </div>
        <button
          onClick={() => openEdit()}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-flag-red text-white font-semibold text-sm"
        >
          <Plus className="size-4" /> Add media
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-flag-yellow/40 bg-flag-yellow/10 p-4 flex gap-3 text-sm">
        <Info className="size-5 text-flag-red shrink-0" />
        <div>
          Upload an image or video file directly, or paste a URL (e.g. YouTube, Unsplash). Uploaded
          files are stored in the public <code>media</code> bucket and appear in the gallery as soon
          as they are saved with <em>Published</em> on.
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          No media yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl overflow-hidden border border-border bg-card group"
            >
              <div className="aspect-square bg-muted overflow-hidden">
                {r.kind === "photo" ? (
                  <img
                    src={r.url}
                    alt={r.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={r.thumbnail_url ?? r.url}
                    alt={r.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-3">
                <div className="text-xs text-muted-foreground uppercase">
                  {r.category} · {r.kind}
                  {r.published ? "" : " · draft"}
                </div>
                <div className="text-sm font-medium truncate">{r.title || "Untitled"}</div>
                <div className="mt-2 flex justify-end gap-1">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-xs px-2 py-1 rounded hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs px-2 py-1 rounded hover:bg-muted text-flag-red inline-flex items-center gap-1"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display font-bold text-xl">
                {editing.id ? "Edit media" : "Add media"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="size-8 grid place-items-center rounded hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <F label="Kind">
                  <select
                    className="i"
                    value={editing.kind}
                    onChange={(e) =>
                      setEditing({ ...editing, kind: e.target.value as "photo" | "video" })
                    }
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </F>
                <F label="Category">
                  <select
                    className="i"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  >
                    <option>Campus</option>
                    <option>Academics</option>
                    <option>Arts</option>
                    <option>Events</option>
                    <option>Sports</option>
                  </select>
                </F>
              </div>
              <F label="Title">
                <input
                  className="i"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </F>

              <div>
                <div className="text-sm font-medium mb-1.5">
                  {editing.kind === "photo" ? "Photo file" : "Video file / URL"}
                </div>
                <label className="i inline-flex items-center gap-2 cursor-pointer hover:bg-muted">
                  <Upload className="size-4 text-flag-red" />
                  <span className="truncate">{file ? file.name : "Choose file…"}</span>
                  <input
                    type="file"
                    accept={editing.kind === "photo" ? "image/*" : "video/*"}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {editing.url && !file && (
                  <div className="mt-2">
                    <img src={editing.url} alt="" className="h-24 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <F label="Media URL (optional — used instead of an upload)">
                <input
                  className="i"
                  placeholder="https://..."
                  value={editing.url ?? ""}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              </F>

              {editing.kind === "video" && (
                <div>
                  <div className="text-sm font-medium mb-1.5">
                    Thumbnail (optional for uploaded video)
                  </div>
                  <label className="i inline-flex items-center gap-2 cursor-pointer hover:bg-muted">
                    <Upload className="size-4 text-flag-red" />
                    <span className="truncate">
                      {thumbFile ? thumbFile.name : "Choose thumbnail…"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {editing.thumbnail_url && !thumbFile && (
                    <div className="mt-2">
                      <img
                        src={editing.thumbnail_url}
                        alt=""
                        className="h-24 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.published ?? true}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                />{" "}
                Published
              </label>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="h-10 px-4 rounded-full border border-border font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={uploading}
                className="h-10 px-5 rounded-full bg-flag-red text-white font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                {uploading && <Loader2 className="size-4 animate-spin" />}
                {uploading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`.i{width:100%;padding:.55rem .75rem;border:1px solid hsl(var(--border));border-radius:.5rem;background:hsl(var(--background));outline:none}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
