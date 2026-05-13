-- 1. Create Clinics (Tenants) Table
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- 2. Add clinic_id to all existing tables
ALTER TABLE public.profiles ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.patients ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.clinical_notes ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;

-- 3. Create a helper function to get the current user's clinic safely (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 4. Drop old permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can manage patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can manage clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Authenticated users can manage transactions" ON public.transactions;

-- 5. Create Strict Tenant Isolation Policies (LGPD Compliant)
CREATE POLICY "Tenant isolation for profiles" ON public.profiles 
  FOR ALL USING (clinic_id = public.get_my_clinic_id() OR id = auth.uid());

CREATE POLICY "Tenant isolation for patients" ON public.patients 
  FOR ALL USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation for appointments" ON public.appointments 
  FOR ALL USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation for clinical notes" ON public.clinical_notes 
  FOR ALL USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation for transactions" ON public.transactions 
  FOR ALL USING (clinic_id = public.get_my_clinic_id());

-- 6. Automate setting clinic_id on INSERT (so Frontend never has to send it manually)
CREATE OR REPLACE FUNCTION public.set_clinic_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o frontend não enviar o clinic_id, injetamos automaticamente o do usuário logado
  IF NEW.clinic_id IS NULL THEN
    NEW.clinic_id := public.get_my_clinic_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clinic_id_patients BEFORE INSERT ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();
CREATE TRIGGER set_clinic_id_appointments BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();
CREATE TRIGGER set_clinic_id_clinical_notes BEFORE INSERT ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();
CREATE TRIGGER set_clinic_id_transactions BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();
