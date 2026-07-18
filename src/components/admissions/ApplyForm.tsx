import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { PageHero, Section } from "@/components/layout/PageHero";
import badge from "@/assets/badge.png";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Loader2, Upload, X } from "lucide-react";

/**
 * A'Level subject combinations offered by the school. This is the single source
 * of truth for the application form's combination picker — a free-text field let
 * students type combinations we don't teach, which then couldn't be placed.
 */
const SUBJECT_COMBINATIONS = [
  "PCM/ICT — Physics · Chemistry · Mathematics",
  "PEM/SM — Physics · Economics · Mathematics",
  "PCB/SM — Physics · Chemistry · Biology",
  "PEntM/ICT — Biology · Entrepreneurship · Mathematics",
  "PAM/ICT — Physics · Agriculture · Mathematics",
  "BCF/SM — Biology · Chemistry · Food & Nutrition",
  "MEG/SM — Mathematics · Economics · Geography",
  "MEntG/ICT — History · Entrepreneurship · Geography",
  "HED/SM — History · Economics · Divinity",
  "MEntG/ICT — Mathematics · Entrepreneurship · Geography",
  "HEG/SM — History · Economics · Geography",
  "HEL/ICT — History · Economics · Literature in English",
  "HLD/SM — History · Literature in English · Divinity",
  "HDG/SM — History · Divinity · Geography",
  "HLG/SM — History · Literature in English · Geography",
  "HEntG/ICT — History · Entrepreneurship · Geography",
  "HEntL/ICT — History · Entrepreneurship · Literature in English",
  "HEntD/ICT — History · Entrepreneurship · Divinity",
  "DEG/SM — Divinity · Economics · Geography",
  "DEA/SM — Divinity · Economics · Fine Art",
  "DEntG/SM — Divinity · Entrepreneurship · Geography",
  "LED/SM — Literature · Economics · Divinity",
  "LEG/SM — Literature · Economics · Geography",
  "LEA/SM — Literature · Economics · Fine Art",
  "GEA/SM — Geography · Economics · Fine Art",
  "GEntA/ICT — Geography · Economics · Fine Art",
  "HEA/SM — History · Economics · Fine Art",
  "HAG/SM — History, Fine Art, Geography",
];

/**
 * The online application form, folded into the admissions page at the `#apply`
 * anchor. Kept as its own component so it can live inline on /admissions rather
 * than on a standalone /apply route.
 */
export function ApplyForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(initial);
  const [reportCard, setReportCard] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [medicalForm, setMedicalForm] = useState<File | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submittedDate, setSubmittedDate] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    setSubmittedDate(new Date().toLocaleDateString("en-GB"));
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (file: File | null, folder: string) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("applications")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  };

  const buildMessage = (paths?: {
    report_card_path?: string | null;
    photo_path?: string | null;
    medical_form_path?: string | null;
  }) => {
    const lines: string[] = [];
    lines.push(`Applicant: ${form.student_first_name} ${form.student_last_name}`.trim());
    if (form.date_of_birth) lines.push(`Date of birth: ${form.date_of_birth}`);
    if (form.gender) lines.push(`Gender: ${form.gender}`);
    if (form.nationality) lines.push(`Nationality: ${form.nationality}`);
    if (form.religion) lines.push(`Religion: ${form.religion}`);
    if (form.district) lines.push(`Home district: ${form.district}`);
    if (form.subcounty) lines.push(`Subcounty / village: ${form.subcounty}`);
    if (form.level_applying) lines.push(`Level applying: ${form.level_applying}`);
    if (form.boarding_status) lines.push(`Boarding status: ${form.boarding_status}`);
    if (form.subject_combination)
      lines.push(`A'Level subject combination: ${form.subject_combination}`);
    if (form.previous_school) lines.push(`Previous school: ${form.previous_school}`);
    if (form.last_class_completed) lines.push(`Last class completed: ${form.last_class_completed}`);
    if (form.exam_index_number) lines.push(`Exam index number: ${form.exam_index_number}`);
    if (form.exam_year) lines.push(`Exam year: ${form.exam_year}`);
    if (form.father_name)
      lines.push(
        `Father: ${form.father_name}${form.father_phone ? ` (${form.father_phone})` : ""}`,
      );
    if (form.mother_name)
      lines.push(
        `Mother: ${form.mother_name}${form.mother_phone ? ` (${form.mother_phone})` : ""}`,
      );
    if (form.guardian_name)
      lines.push(
        `Guardian: ${form.guardian_name}${form.guardian_phone ? ` (${form.guardian_phone})` : ""}`,
      );
    if (form.emergency_contact_name)
      lines.push(
        `Emergency contact: ${form.emergency_contact_name}${form.emergency_contact_phone ? ` (${form.emergency_contact_phone})` : ""}`,
      );
    if (form.medical_conditions) lines.push(`Known medical conditions: ${form.medical_conditions}`);
    if (form.signature_name)
      lines.push(
        `Signed by: ${form.signature_name}${form.sign_date ? ` on ${form.sign_date}` : ""}`,
      );
    if (form.message) lines.push(`Additional information: ${form.message}`);

    if (paths) {
      if (paths.report_card_path) lines.push(`Report card: ${paths.report_card_path}`);
      if (paths.photo_path) lines.push(`Passport photo: ${paths.photo_path}`);
      if (paths.medical_form_path) lines.push(`Medical form: ${paths.medical_form_path}`);
    }

    return lines.join("\n");
  };

  const resetForm = () => {
    setForm(initial);
    setReportCard(null);
    setPhoto(null);
    setMedicalForm(null);
    setDeclarationAccepted(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Single-flight guard. `busy` alone is not enough — React batches state, so a
    // fast double-click can enter this handler twice before the button disables.
    if (submitting.current) return;

    if (!declarationAccepted) {
      toast.error("Please confirm that the information provided is complete and accurate.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    try {
      const [report_card_path, photo_path, medical_form_path] = await Promise.all([
        upload(reportCard, "reports"),
        upload(photo, "photos"),
        upload(medicalForm, "medical"),
      ]);

      const payload = {
        student_first_name: form.student_first_name.trim(),
        student_last_name: form.student_last_name.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        level_applying: form.level_applying,
        previous_school: form.previous_school.trim() || null,
        parent_name: form.parent_name.trim(),
        parent_phone: form.parent_phone.trim(),
        parent_email: form.parent_email.trim(),
        address: form.address.trim() || null,
        message: buildMessage({ report_card_path, photo_path, medical_form_path }) || null,
        report_card_path,
        photo_path,
        medical_form_path,
      };

      const reference = await submitApplication(payload);

      // Clear the form BEFORE navigating. Otherwise the applicant can press Back,
      // find every field still populated, and submit the same child a second time.
      resetForm();
      toast.success("Application submitted successfully.");
      navigate({ to: "/apply/success", search: reference ? { ref: reference } : {} });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-5xl flex-col gap-6">
      <AlertNote>
        Please complete all required fields and attach the supporting documents requested before
        submitting.
      </AlertNote>

      <div className="overflow-hidden rounded-[2rem] border border-[#1f3d2b] bg-[#f7f3e8] p-6 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col gap-4 border border-[#c89b3c] bg-[#f7f3e8] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#c89b3c] bg-white p-1 shadow-sm ring-2 ring-[#1f3d2b]/10">
              <img
                src={badge}
                alt="Talents College Mukono badge"
                className="h-full w-full rounded-full object-contain bg-white brightness-110 contrast-125"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1f3d2b]">
                TALENTS COLLEGE MUKONO
              </h2>
              <p className="mt-1 text-sm italic text-muted-foreground">POWER OF KNOWLEDGE</p>
            </div>
          </div>
          <div className="text-left text-sm md:text-right">
            <p className="font-semibold uppercase tracking-[0.24em] text-[#c89b3c]">
              Admissions • O&apos;Level &amp; A&apos;Level
            </p>
            <p className="mt-1 font-medium text-foreground">Student Application Form</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-[#c89b3c] pt-4 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground">
            Please submit the full admissions packet for review.
          </p>
          <div className="rounded-full border border-[#1f3d2b]/10 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#1f3d2b]">
            Date submitted: {submittedDate || "—/—/——"}
          </div>
        </div>
      </div>

      <Fieldset title="A. Applicant's personal details" letter="A">
        <Grid2>
          <F label="Full name (as on birth certificate)" required>
            <Input
              required
              value={form.student_first_name}
              onChange={(v) => set("student_first_name", v)}
              placeholder="First name"
            />
          </F>
          <F label="Last name" required>
            <Input
              required
              value={form.student_last_name}
              onChange={(v) => set("student_last_name", v)}
              placeholder="Last name"
            />
          </F>
          <F label="Date of birth" required>
            <Input
              required
              type="date"
              value={form.date_of_birth}
              onChange={(v) => set("date_of_birth", v)}
            />
          </F>
          <F label="Sex" required>
            <Select value={form.gender} onChange={(v) => set("gender", v)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </F>
          <F label="Nationality">
            <Input value={form.nationality} onChange={(v) => set("nationality", v)} />
          </F>
          <F label="Religion">
            <Input value={form.religion} onChange={(v) => set("religion", v)} />
          </F>
          <F label="Home district">
            <Input value={form.district} onChange={(v) => set("district", v)} />
          </F>
          <F label="Sub-county / village">
            <Input value={form.subcounty} onChange={(v) => set("subcounty", v)} />
          </F>
        </Grid2>
      </Fieldset>

      <Fieldset title="B. Class applying for" letter="B">
        <Grid2>
          <F label="Class" required>
            <Select value={form.level_applying} onChange={(v) => set("level_applying", v)}>
              <option value="Senior 1 (O Level)">Senior 1 (O Level)</option>
              <option value="Senior 2 (O Level)">Senior 2 (O Level)</option>
              <option value="Senior 3 (O Level)">Senior 3 (O Level)</option>
              <option value="Senior 4 (O Level)">Senior 4 (O Level)</option>
              <option value="Senior 5 (A Level)">Senior 5 (A Level)</option>
              <option value="Senior 6 (A Level)">Senior 6 (A Level)</option>
            </Select>
          </F>
          <F label="Boarding status">
            <Select value={form.boarding_status} onChange={(v) => set("boarding_status", v)}>
              <option value="Day">Day</option>
              <option value="Boarding">Boarding</option>
            </Select>
          </F>
          <F label="A'Level subject combination">
            <SubjectCombobox
              value={form.subject_combination}
              onChange={(v) => set("subject_combination", v)}
              options={SUBJECT_COMBINATIONS}
            />
          </F>
          <F label="Previous school">
            <Input value={form.previous_school} onChange={(v) => set("previous_school", v)} />
          </F>
          <F label="Last class completed">
            <Input
              value={form.last_class_completed}
              onChange={(v) => set("last_class_completed", v)}
            />
          </F>
          <F label="PLE / UCE index number">
            <Input
              value={form.exam_index_number}
              placeholder="e.g. U1234/010"
              onChange={(v) => set("exam_index_number", v)}
            />
          </F>
          <F label="Year of examination">
            <Input
              value={form.exam_year}
              placeholder="2026"
              onChange={(v) => set("exam_year", v)}
            />
          </F>
        </Grid2>
      </Fieldset>

      <Fieldset title="C. Parent / guardian information" letter="C">
        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-4">
            Optional: List parent and guardian contacts
          </p>
          <Grid2>
            <F label="Father's full name">
              <Input value={form.father_name} onChange={(v) => set("father_name", v)} />
            </F>
            <F label="Father's phone">
              <Input value={form.father_phone} onChange={(v) => set("father_phone", v)} />
            </F>
            <F label="Mother's full name">
              <Input value={form.mother_name} onChange={(v) => set("mother_name", v)} />
            </F>
            <F label="Mother's phone">
              <Input value={form.mother_phone} onChange={(v) => set("mother_phone", v)} />
            </F>
            <F label="Guardian's name (if applicable)">
              <Input value={form.guardian_name} onChange={(v) => set("guardian_name", v)} />
            </F>
            <F label="Guardian's phone">
              <Input value={form.guardian_phone} onChange={(v) => set("guardian_phone", v)} />
            </F>
          </Grid2>
        </div>
        <div className="rounded-lg border border-flag-yellow/40 bg-flag-yellow/10 p-4 mb-5">
          <p className="text-xs font-semibold uppercase text-flag-black mb-4">
            Required: Primary contact information
          </p>
          <Grid2>
            <F label="Full name" required>
              <Input
                required
                value={form.parent_name}
                onChange={(v) => set("parent_name", v)}
                placeholder="Primary contact name"
              />
            </F>
            <F label="Phone number" required>
              <Input
                required
                value={form.parent_phone}
                onChange={(v) => set("parent_phone", v)}
                placeholder="Primary contact phone"
              />
            </F>
            <F label="Email address" required>
              <Input
                required
                type="email"
                value={form.parent_email}
                onChange={(v) => set("parent_email", v)}
                placeholder="Primary contact email"
              />
            </F>
            <F label="Occupation">
              <Input value={form.occupation} onChange={(v) => set("occupation", v)} />
            </F>
            <F label="Home address">
              <Input value={form.address} onChange={(v) => set("address", v)} />
            </F>
          </Grid2>
        </div>
      </Fieldset>

      <Fieldset title="D. Emergency contact & medical information" letter="D">
        <Grid2>
          <F label="Emergency contact name">
            <Input
              value={form.emergency_contact_name}
              onChange={(v) => set("emergency_contact_name", v)}
            />
          </F>
          <F label="Emergency contact phone">
            <Input
              value={form.emergency_contact_phone}
              onChange={(v) => set("emergency_contact_phone", v)}
            />
          </F>
          <F label="Known medical conditions / allergies">
            <textarea
              rows={3}
              className="in w-full"
              value={form.medical_conditions}
              onChange={(e) => set("medical_conditions", e.target.value)}
              placeholder="e.g. Asthma, food allergies, medication in use. Write 'None' if not applicable."
            />
          </F>
        </Grid2>
      </Fieldset>

      <Fieldset title="E. Supporting documents" letter="E">
        <Grid2>
          <F label="Previous report card (PDF or image)">
            <FileInput
              accept="application/pdf,image/*"
              file={reportCard}
              onChange={setReportCard}
            />
          </F>
          <F label="Passport photo (image)">
            <FileInput accept="image/*" file={photo} onChange={setPhoto} />
          </F>
          <F label="Medical form (signed)">
            <FileInput
              accept="application/pdf,image/*"
              file={medicalForm}
              onChange={setMedicalForm}
            />
          </F>
        </Grid2>
        <div className="rounded-3xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
          Attach a scan of the most recent report card, a clear passport photo, and a signed medical
          form where available. This helps the admissions team process your request faster.
        </div>
      </Fieldset>

      <Fieldset title="F. Declaration" letter="F">
        <div className="rounded-3xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
          <p>
            I declare that the information provided in this application is true and complete to the
            best of my knowledge. I understand that false information may lead to cancellation of
            admission.
          </p>
          <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border border-border text-flag-red focus:ring-2 focus:ring-flag-red"
            />
            <span>I confirm that the details above are accurate.</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <Input
              value={form.signature_name}
              placeholder="Name of parent / guardian"
              onChange={(v) => set("signature_name", v)}
            />
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Signature of parent / guardian
            </p>
          </div>
          <F label="Date">
            <Input value={form.sign_date} type="date" onChange={(v) => set("sign_date", v)} />
          </F>
        </div>
      </Fieldset>

      <Fieldset title="G. Additional notes" letter="G">
        <textarea
          rows={4}
          className="in w-full"
          placeholder="Any extra information you want the admissions team to know"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </Fieldset>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Once submitted, you will receive a reference number and the admissions office will contact
          you with the next steps.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-flag-red px-8 font-semibold text-white disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Submitting…" : "Submit application"}
        </button>
      </div>

      <style>{`
        .in {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1px solid hsl(var(--border));
          border-radius: 1rem;
          background: hsl(var(--card));
          outline: none;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .in:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 4px rgb(255 153 0 / 12%);
        }
      `}</style>
    </form>
  );
}

type Form = {
  student_first_name: string;
  student_last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  religion: string;
  district: string;
  subcounty: string;
  level_applying: string;
  boarding_status: string;
  subject_combination: string;
  previous_school: string;
  last_class_completed: string;
  exam_index_number: string;
  exam_year: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  occupation: string;
  address: string;
  father_name: string;
  father_phone: string;
  mother_name: string;
  mother_phone: string;
  guardian_name: string;
  guardian_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  signature_name: string;
  sign_date: string;
  message: string;
};

const initial: Form = {
  student_first_name: "",
  student_last_name: "",
  date_of_birth: "",
  gender: "Male",
  nationality: "Ugandan",
  religion: "",
  district: "",
  subcounty: "",
  level_applying: "Senior 1 (O Level)",
  boarding_status: "Day",
  subject_combination: "",
  previous_school: "",
  last_class_completed: "",
  exam_index_number: "",
  exam_year: "",
  parent_name: "",
  parent_phone: "",
  parent_email: "",
  occupation: "",
  address: "",
  father_name: "",
  father_phone: "",
  mother_name: "",
  mother_phone: "",
  guardian_name: "",
  guardian_phone: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  medical_conditions: "",
  signature_name: "",
  sign_date: "",
  message: "",
};

type ApplicationPayload = Database["public"]["Tables"]["applications"]["Insert"];

/**
 * Submits one application and returns its reference.
 *
 * Goes through the `submit_application` RPC (see the 20260716120000 migration).
 * A plain .insert(...).select("reference") cannot work here: anon has INSERT but
 * no SELECT on public.applications, so the RETURNING clause PostgREST attaches is
 * rejected and the whole insert fails.
 *
 * If the migration has not been applied to this project yet, fall back to an
 * insert with no RETURNING so the parent's application is still saved — they just
 * don't get a reference number on screen.
 */
async function submitApplication(payload: ApplicationPayload): Promise<string | null> {
  const { data, error } = await supabase.rpc("submit_application", {
    payload: payload as unknown as Json,
  });

  if (!error) return (data as string | null) ?? null;

  const missingFn =
    error.code === "PGRST202" ||
    error.code === "42883" ||
    /submit_application/i.test(error.message ?? "");

  if (!missingFn) throw error;

  const { error: insertError } = await supabase.from("applications").insert(payload);
  if (insertError) throw insertError;
  return null;
}

function AlertNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-flag-yellow/40 bg-flag-yellow/10 p-4 text-sm text-flag-black">
      {children}
    </div>
  );
}

function Fieldset({
  title,
  children,
  letter,
}: {
  title: string;
  children: ReactNode;
  letter: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-flag-yellow/20 font-display text-lg font-bold text-flag-black">
          {letter}
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <div className="ml-auto h-px flex-1 bg-border" />
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function F({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        {required ? <span className="text-flag-red">*</span> : null}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
>) {
  return (
    <input {...rest} className="in" value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select className="in" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

/**
 * Typeahead combobox for the subject combination. The stored value is ALWAYS one
 * of the offered combinations — free typing only filters the list; the moment the
 * field loses focus (or the user clears it) any non-matching text is dropped, so a
 * combination we don't offer can never reach the database.
 */
function SubjectCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isControlledOpen = open;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  // Reset the transient filter text whenever the field closes or the value changes
  // externally (e.g. form reset).
  useEffect(() => {
    if (!isControlledOpen) setQuery("");
  }, [isControlledOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current || !(e.target instanceof Node)) return;
      if (!wrapRef.current.contains(e.target)) commit();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [value]);

  const commit = () => {
    // Keep the stored value only if it exactly matches an offered combination.
    if (value && !options.includes(value)) onChange("");
    setOpen(false);
  };

  const choose = (opt: string) => {
    onChange(opt);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          className="in pr-9"
          value={open ? query : value}
          placeholder="Type to search e.g. PCM, HEG…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (open) commit();
            else {
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-label="Toggle subject combinations"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <ul
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-border bg-card p-1 shadow-xl"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No matching combination. Choose one of the offered combinations.
            </li>
          ) : (
            filtered.map((opt, i) => {
              const selected = opt === value;
              return (
                <li key={opt} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(opt)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm",
                      i === active ? "bg-muted" : "",
                      selected ? "font-semibold text-flag-red" : "text-foreground",
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && <Check className="size-4 shrink-0 text-flag-red" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

function FileInput({
  file,
  onChange,
  accept,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  accept: string;
}) {
  return (
    <label className="in flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
      <Upload className="size-4 text-flag-red" />
      <span className="truncate">{file ? file.name : "Choose file"}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
