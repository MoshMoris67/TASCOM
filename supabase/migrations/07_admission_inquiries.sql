-- Admission inquiries (the "Ask a question" form on /admissions)
CREATE TABLE public.admission_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  applying_for TEXT NOT NULL DEFAULT 'Not specified',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.admission_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.admission_inquiries TO authenticated;
GRANT ALL ON public.admission_inquiries TO service_role;
ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit admission inquiries" ON public.admission_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read admission inquiries" ON public.admission_inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update admission inquiries" ON public.admission_inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete admission inquiries" ON public.admission_inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admission_inquiries_set_updated BEFORE UPDATE ON public.admission_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
