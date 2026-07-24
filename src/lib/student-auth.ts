import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DEV_SECRET = "dev-secret-change-in-production";
const SESSION_SECRET = process.env.STUDENT_SESSION_SECRET || DEV_SECRET;

// Anyone who knows the fallback secret can mint a valid session for ANY
// student ID, so this must never reach a deployed site unnoticed.
if (SESSION_SECRET === DEV_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "[student-auth] STUDENT_SESSION_SECRET is not set. " +
      "Student portal sessions can be forged. Set it in your environment now.",
  );
}

export type Student = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  level: string;
  class_stream: string | null;
  date_of_birth: string | null;
  gender: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  address: string | null;
};

export type ResultsRow = {
  id: string;
  student_id: string;
  subject: string;
  score: number | null;
  grade: string | null;
  remarks: string | null;
  term: string;
  year: number;
  created_at: string;
  updated_at: string;
};

export type AssignmentRow = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  subject: string;
  assigned_date: string;
  due_date: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SessionSummary = {
  id: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  /** True for the device making the request. */
  current: boolean;
};

type LoginResponse =
  | { ok: true; student: Student; token: string }
  | { ok: false; error: string };

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100_000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(Buffer.from(derivedKey).toString("hex"));
    });
  });
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  return new Promise<boolean>((resolve) => {
    crypto.pbkdf2(password, salt, 100_000, 64, "sha512", (err, derivedKey) => {
      if (err) return resolve(false);
      resolve(Buffer.from(derivedKey).toString("hex") === hash);
    });
  });
}

/** How long a student portal session stays valid. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Only touch last_seen_at this often, so reads don't cause a write each time. */
const HEARTBEAT_INTERVAL_MS = 15 * 60 * 1000;

const SESSION_STORE_MISSING =
  "The student session store is not set up yet. Run supabase/migrations/11_student_sessions.sql, then try again.";

function createToken(studentId: string): { token: string; expiresAt: Date } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  const payload = JSON.stringify({
    studentId,
    iat: now,
    exp: expiresAt,
    // Without a nonce, two logins for the same student in the same
    // millisecond would produce byte-identical tokens, and the unique index
    // on token_hash would reject the second one.
    n: crypto.randomBytes(12).toString("base64url"),
  });

  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  return {
    token: `${Buffer.from(payload).toString("base64url")}.${signature}`,
    expiresAt: new Date(expiresAt),
  };
}

/**
 * Only the hash of a token is ever stored. If `student_sessions` leaked, the
 * rows could not be replayed as logins.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** PostgREST reports an absent table as PGRST205; Postgres itself as 42P01. */
function isMissingSessionTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  return /student_sessions/.test(error.message ?? "") && /(does not exist|not find)/i.test(error.message ?? "");
}

/** Constant-time compare so signature checking can't be timed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyToken(token: string): { studentId: string } | null {
  try {
    const [b64Payload, signature] = token.split(".");
    if (!b64Payload || !signature) return null;

    const payload = Buffer.from(b64Payload, "base64url").toString();
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (!safeEqual(signature, expectedSig)) return null;

    const data = JSON.parse(payload);
    if (!data.studentId) return null;

    // The old token format embedded `iat` but never checked it, so sessions
    // never expired. Tokens without a valid `exp` are now rejected, which
    // simply forces one more sign-in for anyone holding a legacy token.
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;

    return { studentId: data.studentId };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Session store                                                       */
/* ------------------------------------------------------------------ */

/** Best-effort user agent, so an admin can tell one device from another. */
function currentUserAgent(): string | null {
  try {
    return getRequestHeader("user-agent")?.slice(0, 300) ?? null;
  } catch {
    return null;
  }
}

/** Records a freshly issued token. Throws if the store is unreachable. */
async function recordSession(token: string, studentId: string, expiresAt: Date): Promise<void> {
  const { error } = await supabaseAdmin.from("student_sessions").insert({
    student_id: studentId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    user_agent: currentUserAgent(),
  });

  if (error) {
    if (isMissingSessionTable(error)) {
      console.error("[student-auth] student_sessions table is missing. Run migration 11.");
      throw new Error(SESSION_STORE_MISSING);
    }
    console.error("[student-auth] could not record session:", error);
    throw new Error("Could not start your session. Please try again.");
  }
}

type SessionCheck = { ok: true; studentId: string } | { ok: false; error: string };

/**
 * Full session check: signature and expiry locally, then the database row.
 *
 * The database step is what makes sign-out real. Signature-only verification
 * cannot be revoked — a copied token stays valid until it expires, no matter
 * how many times the student signs out.
 *
 * Fails closed. If the store cannot be reached, access is refused rather than
 * silently falling back to the unrevocable behaviour this replaced.
 */
async function verifySession(token: string): Promise<SessionCheck> {
  const local = verifyToken(token);
  if (!local) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { data, error } = await supabaseAdmin
    .from("student_sessions")
    .select("id,revoked_at,expires_at,last_seen_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (error) {
    if (isMissingSessionTable(error)) {
      console.error("[student-auth] student_sessions table is missing. Run migration 11.");
      return { ok: false, error: SESSION_STORE_MISSING };
    }
    console.error("[student-auth] session lookup failed:", error);
    return { ok: false, error: "Could not verify your session. Please try again." };
  }

  if (!data || data.revoked_at) {
    return { ok: false, error: "You have been signed out. Please sign in again." };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  // Throttled heartbeat so an admin can see which sessions are genuinely in
  // use, without writing a row on every single request.
  const lastSeen = new Date(data.last_seen_at).getTime();
  if (Number.isFinite(lastSeen) && Date.now() - lastSeen > HEARTBEAT_INTERVAL_MS) {
    const { error: touchError } = await supabaseAdmin
      .from("student_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", data.id);
    if (touchError) console.error("[student-auth] heartbeat failed:", touchError);
  }

  return { ok: true, studentId: local.studentId };
}

/** Revokes a single session — the device that asked to sign out. */
async function revokeSession(token: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("student_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("revoked_at", null);

  if (error && !isMissingSessionTable(error)) {
    console.error("[student-auth] could not revoke session:", error);
  }
}

/** Revokes every session for a student — password change, or "sign out everywhere". */
async function revokeAllSessions(studentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("student_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("student_id", studentId)
    .is("revoked_at", null);

  if (error && !isMissingSessionTable(error)) {
    console.error("[student-auth] could not revoke sessions:", error);
  }
}

/**
 * Occasional cleanup, so the table doesn't grow forever without needing a
 * scheduled job configured. Cheap, and failure is not interesting.
 */
async function maybePurgeSessions(): Promise<void> {
  if (Math.random() > 0.02) return;
  try {
    await supabaseAdmin.rpc("purge_expired_student_sessions");
  } catch {
    /* housekeeping only */
  }
}

function toStudent(row: any): Student {
  return {
    id: row.id,
    student_id: row.student_id,
    first_name: row.first_name,
    last_name: row.last_name,
    photo_url: row.photo_url ?? null,
    level: row.level,
    class_stream: row.class_stream ?? null,
    date_of_birth: row.date_of_birth ?? null,
    gender: row.gender ?? null,
    parent_email: row.parent_email ?? null,
    parent_phone: row.parent_phone ?? null,
    address: row.address ?? null,
  };
}

export const loginStudent = createServerFn({ method: "POST" })
  .validator((data: { studentId: string; password: string }) => data)
  .handler(async ({ data }): Promise<LoginResponse> => {
    const { studentId, password } = data;

    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "active")
      .single();

    if (error || !student) {
      return { ok: false, error: "Invalid student ID or password." };
    }

    const valid = await verifyPassword(password, student.password_hash);
    if (!valid) {
      return { ok: false, error: "Invalid student ID or password." };
    }

    const { token, expiresAt } = createToken(student.id);

    try {
      await recordSession(token, student.id, expiresAt);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Could not start your session.",
      };
    }

    void maybePurgeSessions();

    return { ok: true, student: toStudent(student), token };
  });

export const getStudentSession = createServerFn()
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }): Promise<LoginResponse> => {
    const token = data.token;
    if (!token) return { ok: false, error: "Not logged in." };

    const verified = await verifySession(token);
    if (!verified.ok) return { ok: false, error: verified.error };

    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", verified.studentId)
      .eq("status", "active")
      .single();

    if (error || !student) {
      // The account was deleted or deactivated while signed in — the session
      // should not outlive it.
      await revokeAllSessions(verified.studentId);
      return { ok: false, error: "Student not found." };
    }

    return { ok: true, student: toStudent(student), token };
  });

export const getStudentResults = createServerFn()
  .validator((data: { token?: string; term?: string; year?: number }) => data)
  .handler(async ({ data }) => {
    const session = await getStudentSession({ data: { token: data.token } });
    if (!session.ok) return { ok: false, error: session.error, results: [] as ResultsRow[] };

    let query = supabaseAdmin
      .from("results")
      .select("*")
      .eq("student_id", session.student.id)
      .order("year", { ascending: false })
      .order("term", { ascending: true });

    if (data.term) query = query.eq("term", data.term);
    if (data.year) query = query.eq("year", data.year);

    const { data: results, error } = await query;
    if (error) return { ok: false, error: error.message, results: [] as ResultsRow[] };

    return { ok: true, results: (results ?? []) as ResultsRow[] };
  });

export const getStudentAssignments = createServerFn()
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    const session = await getStudentSession({ data: { token: data.token } });
    if (!session.ok) return { ok: false, error: session.error, assignments: [] as AssignmentRow[] };

    const { data: assignments, error } = await supabaseAdmin
      .from("assignments")
      .select("*")
      .eq("student_id", session.student.id)
      .order("due_date", { ascending: true });

    if (error) return { ok: false, error: error.message, assignments: [] as AssignmentRow[] };

    return { ok: true, assignments: (assignments ?? []) as AssignmentRow[] };
  });

export const createStudent = createServerFn({ method: "POST" })
  .validator(
    (data: {
      studentId: string;
      password: string;
      firstName: string;
      lastName: string;
      level?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const passwordHash = await hashPassword(data.password);

    const { data: student, error } = await supabaseAdmin
      .from("students")
      .upsert(
        {
          student_id: data.studentId,
          password_hash: passwordHash,
          first_name: data.firstName,
          last_name: data.lastName,
          level: data.level ?? "O Level",
          status: "active",
        },
        { onConflict: "student_id" },
      )
      .select("*")
      .single();

    if (error || !student) return { ok: false, error: error?.message ?? "Failed to create student." };

    // This is an upsert, so it doubles as the password-reset path. A password
    // change must not leave old sessions alive — that is the whole point of
    // resetting it when an account is thought to be compromised.
    await revokeAllSessions(student.id);

    return { ok: true, student: toStudent(student) };
  });

/**
 * Signs out the device that called it.
 *
 * This used to return `{ ok: true }` without touching anything, so the token
 * stayed valid after sign-out. It now revokes the session row, and the next
 * request carrying that token is rejected.
 */
export const logoutStudent = createServerFn({ method: "POST" })
  .validator((data?: { token?: string }) => data ?? {})
  .handler(async ({ data }) => {
    if (data?.token) await revokeSession(data.token);
    return { ok: true };
  });

/** Signs out every device for the student holding this token. */
export const logoutStudentEverywhere = createServerFn({ method: "POST" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.token) return { ok: false, error: "Not logged in." };

    const verified = await verifySession(data.token);
    if (!verified.ok) return { ok: false, error: verified.error };

    await revokeAllSessions(verified.studentId);
    return { ok: true };
  });

/** Active sessions for the signed-in student, newest first. */
export const listStudentSessions = createServerFn()
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.token) return { ok: false, error: "Not logged in.", sessions: [] as SessionSummary[] };

    const verified = await verifySession(data.token);
    if (!verified.ok) return { ok: false, error: verified.error, sessions: [] as SessionSummary[] };

    const currentHash = hashToken(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("student_sessions")
      .select("id,token_hash,user_agent,created_at,last_seen_at,expires_at")
      .eq("student_id", verified.studentId)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("last_seen_at", { ascending: false });

    if (error) {
      return { ok: false, error: "Could not load your sessions.", sessions: [] as SessionSummary[] };
    }

    const sessions: SessionSummary[] = (rows ?? []).map((r) => ({
      id: r.id,
      user_agent: r.user_agent,
      created_at: r.created_at,
      last_seen_at: r.last_seen_at,
      expires_at: r.expires_at,
      // Never send token hashes to the browser — just flag which one is this device.
      current: r.token_hash === currentHash,
    }));

    return { ok: true, sessions };
  });
