import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, X, Mail, MessageCircleQuestion } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesAdmin,
});

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  applying_for: string;
  message: string;
  status: string;
  created_at: string;
};

const statuses = ["new", "read", "replied"] as const;

function InquiriesAdmin() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [viewing, setViewing] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase
      .from("admission_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Inquiry[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("admission_inquiries")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
    setViewing((v) => (v && v.id === id ? { ...v, status } : v));
  };

  const openView = (r: Inquiry) => {
    setViewing(r);
    if (r.status === "new") setStatus(r.id, "read");
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <h1 className="font-display font-black text-3xl">Admission Inquiries</h1>
      <p className="text-muted-foreground mt-1">
        Questions submitted through the "Ask a question" form on the admissions page.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              filter === s ? "bg-flag-red text-white border-flag-red" : "bg-card border-border"
            }`}
          >
            {s} {s !== "all" && `(${rows.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No inquiries.</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">From</th>
                <th className="text-left p-3">Applying for</th>
                <th className="text-left p-3">Received</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium">
                    {r.name}
                    <div className="text-xs text-muted-foreground font-normal">{r.email}</div>
                    <div className="text-xs text-muted-foreground font-normal">{r.phone}</div>
                  </td>
                  <td className="p-3">{r.applying_for}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge s={r.status} />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openView(r)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted"
                    >
                      <Eye className="size-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
              <div>
                <h2 className="font-display font-bold text-xl">{viewing.name}</h2>
                <div className="text-xs text-muted-foreground">
                  {viewing.email} · {viewing.phone}
                </div>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="size-8 grid place-items-center rounded hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircleQuestion className="size-4" />
                Applying for: <span className="font-medium text-foreground">{viewing.applying_for}</span>
              </div>
              <div className="whitespace-pre-wrap rounded-xl bg-muted p-4">{viewing.message}</div>
              <a
                href={`mailto:${viewing.email}?subject=${encodeURIComponent("Re: Your inquiry to Talents College Mukono")}`}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-border text-sm hover:bg-muted"
              >
                <Mail className="size-4" /> Reply by email
              </a>
              <div className="pt-4 border-t border-border">
                <div className="text-sm font-medium mb-2">Status</div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(viewing.id, s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        viewing.status === s
                          ? "bg-flag-red text-white border-flag-red"
                          : "border-border"
                      }`}
                    >
                      {s}
                    </button>
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

function StatusBadge({ s }: { s: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    read: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    replied: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[s] ?? "bg-muted"}`}>
      {s}
    </span>
  );
}
