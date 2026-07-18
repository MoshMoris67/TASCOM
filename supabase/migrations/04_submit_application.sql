-- ══════════════════════════════════════════════════════════════════════════════
--  04 — SUBMIT APPLICATION
--
--  THE ONLY PLACE public.submit_application IS DEFINED.
--
--  Replaces the two snippets that both used to define it:
--      FIX APPLICATION STATUS   (fix_application_submission.sql)  — DELETE IT
--      MEDICAL FORM             (medical_form_path.sql)           — DELETE IT
--
--  Delete both. Not "stop running them" — delete them. That is the fix.
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ── Why this snippet exists ───────────────────────────────────────────────────
--
-- FIX APPLICATION STATUS and MEDICAL FORM both ran:
--
--     CREATE OR REPLACE FUNCTION public.submit_application(payload jsonb)
--
-- Same name, same argument list = the same function. CREATE OR REPLACE does not
-- warn, does not conflict, does not version. Whichever ran last silently became
-- the only one that exists.
--
-- They differ in exactly one thing:
--
--     FIX APPLICATION STATUS  ->  INSERT ( ..., report_card_path, photo_path )
--     MEDICAL FORM            ->  INSERT ( ..., report_card_path, photo_path,
--                                               medical_form_path )
--
-- MEDICAL FORM was written 8 minutes after FIX APPLICATION STATUS, so in creation
-- order the correct one wins and everything works. The medical form attachment
-- went missing anyway — which means FIX APPLICATION STATUS was re-run afterwards.
-- Snippets have no order and no history; re-running one at any time silently
-- rewrites the function, and nothing anywhere records that it happened.
--
-- That is not a mistake anyone made twice. It is a shape of problem that recurs
-- for as long as two snippets claim the same function. Hence: one owner.
--
-- ── Safe to run ───────────────────────────────────────────────────────────────
--
-- Idempotent. Run it now, run it again next year, run it after a fresh CORE
-- SCHEMA. It never destroys data and never overwrites a good value.

-- ── 1. The column ─────────────────────────────────────────────────────────────
-- CORE SCHEMA creates public.applications without this column; MEDICAL FORM used
-- to add it. Folded in here so that snippet can be deleted outright.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS medical_form_path TEXT;

-- ── 2. The function ───────────────────────────────────────────────────────────
-- Submitting through a SECURITY DEFINER function (rather than a plain insert) is
-- the correct design and is kept from FIX APPLICATION STATUS: anon has INSERT but
-- no SELECT on public.applications, so `.insert(...).select("reference")` makes
-- PostgREST attach a RETURNING clause, RETURNING needs SELECT privilege, and
-- Postgres rejects the whole statement with 42501. The function returns the
-- reference without granting anon any read access to the table.
CREATE OR REPLACE FUNCTION public.submit_application(payload jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref     text;
  dupe_ref    text;
  v_first     text := nullif(btrim(payload->>'student_first_name'), '');
  v_last      text := nullif(btrim(payload->>'student_last_name'), '');
  v_dob       date;
  v_gender    text := nullif(btrim(payload->>'gender'), '');
  v_level     text := nullif(btrim(payload->>'level_applying'), '');
  v_pname     text := nullif(btrim(payload->>'parent_name'), '');
  v_pphone    text := nullif(btrim(payload->>'parent_phone'), '');
  v_pemail    text := lower(nullif(btrim(payload->>'parent_email'), ''));
BEGIN
  -- Server-side validation. Never trust the browser to have enforced `required`.
  IF v_first IS NULL OR v_last IS NULL THEN
    RAISE EXCEPTION 'Applicant first and last name are required.';
  END IF;
  IF v_gender IS NULL OR v_level IS NULL THEN
    RAISE EXCEPTION 'Sex and the class being applied for are required.';
  END IF;
  IF v_pname IS NULL OR v_pphone IS NULL OR v_pemail IS NULL THEN
    RAISE EXCEPTION 'Parent / guardian name, phone and email are required.';
  END IF;
  IF v_pemail !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Please provide a valid email address.';
  END IF;

  BEGIN
    v_dob := (payload->>'date_of_birth')::date;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Please provide a valid date of birth.';
  END;
  IF v_dob IS NULL OR v_dob >= current_date THEN
    RAISE EXCEPTION 'Please provide a valid date of birth.';
  END IF;

  -- Duplicate guard: if the same applicant was submitted in the last 10 minutes,
  -- hand back the reference that already exists instead of creating another row.
  SELECT reference INTO dupe_ref
  FROM public.applications
  WHERE lower(btrim(student_first_name)) = lower(v_first)
    AND lower(btrim(student_last_name))  = lower(v_last)
    AND date_of_birth = v_dob
    AND btrim(parent_phone) = v_pphone
    AND created_at > now() - interval '10 minutes'
  ORDER BY created_at DESC
  LIMIT 1;

  IF dupe_ref IS NOT NULL THEN
    RETURN dupe_ref;
  END IF;

  -- 14 columns. medical_form_path is the last one, and it is the whole point.
  INSERT INTO public.applications (
    student_first_name, student_last_name, date_of_birth, gender, level_applying,
    previous_school, parent_name, parent_phone, parent_email, address, message,
    report_card_path, photo_path, medical_form_path
  )
  VALUES (
    v_first,
    v_last,
    v_dob,
    v_gender,
    v_level,
    nullif(btrim(coalesce(payload->>'previous_school', '')), ''),
    v_pname,
    v_pphone,
    v_pemail,
    nullif(btrim(coalesce(payload->>'address', '')), ''),
    nullif(btrim(coalesce(payload->>'message', '')), ''),
    nullif(btrim(coalesce(payload->>'report_card_path', '')), ''),
    nullif(btrim(coalesce(payload->>'photo_path', '')), ''),
    nullif(btrim(coalesce(payload->>'medical_form_path', '')), '')
  )
  RETURNING reference INTO new_ref;

  RETURN new_ref;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_application(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(jsonb) TO anon, authenticated;

-- Speeds up the duplicate lookup above.
CREATE INDEX IF NOT EXISTS applications_dupe_lookup_idx
  ON public.applications (parent_phone, date_of_birth, created_at DESC);

-- ── 3. Version stamp ──────────────────────────────────────────────────────────
-- Ask the DATABASE what it is running. Never trust the file tree — the file tree
-- was right the whole time this bug was live.
COMMENT ON FUNCTION public.submit_application(jsonb) IS
  'Owner: snippet 04_submit_application. Inserts 14 columns INCLUDING '
  'medical_form_path. If you are reading this comment, the correct version is '
  'deployed. Supersedes FIX APPLICATION STATUS and MEDICAL FORM — delete those.';

-- ── 4. Backfill ───────────────────────────────────────────────────────────────
--
-- Every application submitted while the 13-column function was live has a NULL
-- medical_form_path. The file itself uploaded fine and is still in the
-- `applications` storage bucket — only the pointer was dropped.
--
-- The pointer is recoverable: the client writes the path into `message` as
-- "Medical form: medical/<uuid>.pdf" on its own line, and `message` was never
-- dropped. So the data was misfiled, not lost.
--
-- Only touches rows that are currently NULL, so it can never overwrite a good
-- value, and re-running it is a no-op.
UPDATE public.applications
SET medical_form_path = btrim(substring(message from 'Medical form: ([^\n\r]+)'))
WHERE medical_form_path IS NULL
  AND message IS NOT NULL
  AND message ~ 'Medical form: [^\n\r]+';

UPDATE public.applications
SET report_card_path = btrim(substring(message from 'Report card: ([^\n\r]+)'))
WHERE report_card_path IS NULL
  AND message IS NOT NULL
  AND message ~ 'Report card: [^\n\r]+';

UPDATE public.applications
SET photo_path = btrim(substring(message from 'Passport photo: ([^\n\r]+)'))
WHERE photo_path IS NULL
  AND message IS NOT NULL
  AND message ~ 'Passport photo: [^\n\r]+';

-- ── 5. Tell me it worked ──────────────────────────────────────────────────────
-- Output of this snippet. Both columns should read true.
SELECT
  (SELECT prosrc LIKE '%medical_form_path%'
     FROM pg_proc WHERE proname = 'submit_application')          AS function_is_correct,
  NOT EXISTS (
    SELECT 1 FROM public.applications
    WHERE medical_form_path IS NULL AND message ~ 'Medical form: '
  )                                                              AS backfill_complete;
