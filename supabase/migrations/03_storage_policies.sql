
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'anyone upload to applications bucket'
  ) THEN
    CREATE POLICY "anyone upload to applications bucket" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'applications');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'admins read application files'
  ) THEN
    CREATE POLICY "admins read application files" ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'applications' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'admins delete application files'
  ) THEN
    CREATE POLICY "admins delete application files" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'applications' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
