-- STUDENT SESSIONS
--
-- Owns: public.student_sessions, public.purge_expired_student_sessions()
--
-- Why this exists
-- ---------------
-- Student portal tokens were stateless HMACs. Signing out only cleared
-- localStorage, so a token that had been copied, logged, or left in a browser
-- on a shared machine stayed valid until it expired. There was no way to
-- revoke one, and no way to see what was active.
--
-- This table makes sessions real: every issued token gets a row, and every
-- request checks that the row is still live. Revoking is then a single UPDATE.
--
-- What is stored
-- --------------
-- token_hash is SHA-256 of the token, never the token itself. If this table
-- ever leaked, the rows could not be replayed as logins.
--
-- IDEMPOTENT — safe to re-run. Per 00_README.md, snippets have no order and no
-- history, so anything in this folder must survive being run twice.

CREATE TABLE IF NOT EXISTS public.student_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ
);

COMMENT ON TABLE  public.student_sessions IS
  'Active student portal sessions. Owned by 11_student_sessions.sql.';
COMMENT ON COLUMN public.student_sessions.token_hash IS
  'SHA-256 of the session token. The raw token is never stored.';

-- Lookup path on every authenticated portal request.
CREATE INDEX IF NOT EXISTS student_sessions_token_hash_idx
  ON public.student_sessions (token_hash);

-- "Revoke everything for this student" and the admin session list.
CREATE INDEX IF NOT EXISTS student_sessions_student_id_idx
  ON public.student_sessions (student_id);

-- Cleanup sweep.
CREATE INDEX IF NOT EXISTS student_sessions_expires_at_idx
  ON public.student_sessions (expires_at);

GRANT SELECT, DELETE ON public.student_sessions TO authenticated;
GRANT ALL ON public.student_sessions TO service_role;

ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

-- All application access goes through the service-role client in
-- src/lib/student-auth.ts, which bypasses RLS. These policies exist so an
-- admin can audit and revoke sessions from the dashboard, and so that nobody
-- else can read them.
DROP POLICY IF EXISTS "admins read student sessions" ON public.student_sessions;
CREATE POLICY "admins read student sessions"
  ON public.student_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete student sessions" ON public.student_sessions;
CREATE POLICY "admins delete student sessions"
  ON public.student_sessions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Housekeeping. Expired and revoked rows have no value after a short grace
-- period, and the table would otherwise grow forever.
-- Call it from a scheduled job, or let the app sweep opportunistically.
CREATE OR REPLACE FUNCTION public.purge_expired_student_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed INTEGER;
BEGIN
  DELETE FROM public.student_sessions
  WHERE expires_at < now() - INTERVAL '7 days'
     OR (revoked_at IS NOT NULL AND revoked_at < now() - INTERVAL '7 days');

  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_student_sessions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_student_sessions() TO service_role;

-- Verification. All four columns must read t.
SELECT
  to_regclass('public.student_sessions') IS NOT NULL AS table_ok,
  (SELECT count(*) FROM pg_indexes
     WHERE schemaname = 'public' AND tablename = 'student_sessions') >= 3 AS indexes_ok,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid = 'public.student_sessions'::regclass) AS rls_ok,
  to_regprocedure('public.purge_expired_student_sessions()') IS NOT NULL AS purge_fn_ok;
