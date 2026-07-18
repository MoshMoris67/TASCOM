import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, X, FileText, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: ApplicationsAdmin,
});

type App = {
  id: string; reference: string; student_first_name: string; student_last_name: string;
  date_of_birth: string; gender: string; level_applying: string; previous_school: string | null;
  parent_name: string; parent_phone: string; parent_email: string; address: string | null;
  message: string | null; report_card_path: string | null; photo_path: string | null;
  medical_form_path: string | null;
  status: string; created_at: string;
};

const statuses = ["submitted", "reviewing", "accepted", "rejected"] as const;

function ApplicationsAdmin() {
  const [rows, setRows] = useState<App[]>([]);
  const [viewing, setViewing] = useState<App | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    setRows((data as App[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated"); load();
    setViewing((v) => v && v.id === id ? { ...v, status } : v);
  };

  const openFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("applications").createSignedUrl(path, 60 * 30);
    if (error || !data) return toast.error("Cannot open file");
    window.open(data.signedUrl, "_blank");
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <h1 className="font-display font-black text-3xl">Applications</h1>
      <p className="text-muted-foreground mt-1">Review student applications submitted online.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === s ? "bg-flag-red text-white border-flag-red" : "bg-card border-border"}`}>
            {s} {s !== "all" && `(${rows.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No applications.</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]"><thead className="bg-muted"><tr>
            <th className="text-left p-3">Ref</th><th className="text-left p-3">Student</th>
            <th className="text-left p-3">Level</th><th className="text-left p-3">Submitted</th>
            <th className="text-left p-3">Status</th><th className="p-3"></th>
          </tr></thead><tbody>{filtered.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-mono text-xs">{r.reference}</td>
              <td className="p-3 font-medium">{r.student_first_name} {r.student_last_name}</td>
              <td className="p-3">{r.level_applying}</td>
              <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="p-3"><StatusBadge s={r.status} /></td>
              <td className="p-3"><button onClick={() => setViewing(r)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted"><Eye className="size-3" /> View</button></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
              <div>
                <h2 className="font-display font-bold text-xl">{viewing.student_first_name} {viewing.student_last_name}</h2>
                <div className="text-xs text-muted-foreground font-mono">{viewing.reference}</div>
              </div>
              <button onClick={() => setViewing(null)} className="size-8 grid place-items-center rounded hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Info label="Name" value={`${viewing.student_first_name} ${viewing.student_last_name}`} />
                  <Info label="DOB" value={viewing.date_of_birth} />
                  <Info label="Gender" value={viewing.gender} />
                  <Info label="Level Applying" value={viewing.level_applying} />
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Academic Background</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Info label="Previous School" value={viewing.previous_school ?? "—"} />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Primary Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Info label="Name" value={viewing.parent_name} />
                  <Info label="Phone" value={viewing.parent_phone} />
                  <Info label="Email" value={viewing.parent_email} />
                  <Info label="Address" value={viewing.address ?? "—"} />
                </div>
              </div>

              {/* Full Details Section */}
              {viewing.message && (
                <div className="pt-3 border-t border-border">
                  <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Complete Application Details</h3>
                  <div className="rounded-lg border border-border bg-card p-4 text-xs font-mono text-foreground/80 max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                    {viewing.message}
                  </div>
                </div>
              )}

              {/* Supporting Documents Section */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Supporting Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {viewing.report_card_path && (
                    <button onClick={() => openFile(viewing.report_card_path!)} className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-border text-sm hover:bg-muted transition-colors"><FileText className="size-4" /> Report card</button>
                  )}
                  {viewing.photo_path && (
                    <button onClick={() => openFile(viewing.photo_path!)} className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-border text-sm hover:bg-muted transition-colors"><ImageIcon className="size-4" /> Passport photo</button>
                  )}
                  {viewing.medical_form_path && (
                    <button onClick={() => openFile(viewing.medical_form_path!)} className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-border text-sm hover:bg-muted transition-colors"><FileText className="size-4" /> Medical form</button>
                  )}
                  {!viewing.report_card_path && !viewing.photo_path && !viewing.medical_form_path && (
                    <p className="text-muted-foreground">No documents attached</p>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="text-sm font-medium mb-2">Status</div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button key={s} onClick={() => setStatus(viewing.id, s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${viewing.status === s ? "bg-flag-red text-white border-flag-red" : "border-border"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5">{value}</div></div>;
}

function StatusBadge({ s }: { s: string }) {
  const colors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    reviewing: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    accepted: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[s] ?? "bg-muted"}`}>{s}</span>;
}
