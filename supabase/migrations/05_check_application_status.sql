-- Adds the missing other half of the application flow.
--
-- `apply.success` hands the parent a reference number ("TCM-XXXXXXXX") and tells them
-- to keep it safe, but nothing on the site ever accepted it back. Meanwhile
-- `applications.status` is a real column that admin.applications already flips between
-- submitted / reviewing / accepted / rejected — the parent just had no way to see it.
--
-- The table itself stays unreadable to anon (that grant is deliberate: it holds minors'
-- dates of birth, home addresses and parent phone numbers). This exposes exactly one
-- row through one function, and only to someone who already knows BOTH the reference
-- and the phone number on that application. Reference alone is not enough — otherwise
-- anyone could walk the keyspace and read applicant names.

CREATE OR REPLACE FUNCTION public.check_application_status(
  p_reference text,
  p_phone     text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref    text := upper(btrim(coalesce(p_reference, '')));
  v_phone  text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_row    public.applications%ROWTYPE;
BEGIN
  IF v_ref = '' OR v_phone = '' THEN
    RAISE EXCEPTION 'Enter both your reference number and the phone number used on the application.';
  END IF;

  -- Compare only the last 9 digits, so +256 773 207 394 / 0773207394 / 0773 207 394
  -- all match the one that was typed into the form months earlier.
  SELECT * INTO v_row
  FROM public.applications
  WHERE upper(btrim(reference)) = v_ref
    AND right(regexp_replace(parent_phone, '\D', '', 'g'), 9) = right(v_phone, 9)
  LIMIT 1;

  IF NOT FOUND THEN
    -- One message for "no such reference" and for "wrong phone". Telling them apart
    -- would confirm which references exist.
    RETURN jsonb_build_object('found', false);
  END IF;

  -- Only what the parent already gave us. No address, no uploaded file paths, no
  -- internal id, no admin notes.
  RETURN jsonb_build_object(
    'found',        true,
    'reference',    v_row.reference,
    'student_name', v_row.student_first_name || ' ' || v_row.student_last_name,
    'level',        v_row.level_applying,
    'status',       v_row.status,
    'submitted_at', v_row.created_at,
    'updated_at',   v_row.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_application_status(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_application_status(text, text) TO anon, authenticated;

-- The lookup above filters on a normalised reference, so a plain index on `reference`
-- can't serve it.
CREATE INDEX IF NOT EXISTS applications_reference_upper_idx
  ON public.applications (upper(btrim(reference)));
