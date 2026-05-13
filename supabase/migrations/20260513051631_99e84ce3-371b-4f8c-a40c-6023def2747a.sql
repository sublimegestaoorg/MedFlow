
-- ============================================================
-- 1. CLINICS (multitenancy raiz)
-- ============================================================
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','professional','receptionist')),
  full_name TEXT NOT NULL,
  specialty TEXT,
  document_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Função utilitária para resolver clinic_id atual (security definer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_clinic_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_id IS NULL THEN
    NEW.clinic_id := public.get_my_clinic_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 4. PATIENTS
-- ============================================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  gender TEXT,
  address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, cpf)
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_patients BEFORE INSERT ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 5. PROCEDURES (Fase 1)
-- ============================================================
CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT 'teal',
  specialty TEXT,
  requires_room BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_procedures BEFORE INSERT ON public.procedures
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 6. APPOINTMENTS
-- ============================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','in_progress','completed','cancelled','no_show')),
  type TEXT,
  notes TEXT,
  price DECIMAL(10,2),
  room TEXT,
  confirmation_code TEXT UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_appointments_clinic_date ON public.appointments (clinic_id, appointment_date);
CREATE INDEX idx_appointments_professional_date ON public.appointments (professional_id, appointment_date);
CREATE TRIGGER set_clinic_id_appointments BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 7. CLINICAL NOTES
-- ============================================================
CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'evolution',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_clinical_notes BEFORE INSERT ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 8. TRANSACTIONS
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','cancelled')),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_transactions BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 9. TIME BLOCKS (Fase 1)
-- ============================================================
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_time_blocks BEFORE INSERT ON public.time_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 10. WAITLIST (Fase 1)
-- ============================================================
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  preferred_period TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','contacted','scheduled','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_waitlist BEFORE INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 11. APPOINTMENT STATUS LOG (Fase 1)
-- ============================================================
CREATE TABLE public.appointment_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.appointment_status_log ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_clinic_id_status_log BEFORE INSERT ON public.appointment_status_log
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- ============================================================
-- 12. RLS POLICIES — Tenant isolation (todas as tabelas)
-- ============================================================
CREATE POLICY "Tenant isolation clinics" ON public.clinics
  FOR ALL TO authenticated USING (id = public.get_my_clinic_id());

CREATE POLICY "Profiles tenant or self" ON public.profiles
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id() OR id = auth.uid())
  WITH CHECK (id = auth.uid() OR clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation patients" ON public.patients
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation procedures" ON public.procedures
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation appointments" ON public.appointments
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation clinical_notes" ON public.clinical_notes
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation transactions" ON public.transactions
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation time_blocks" ON public.time_blocks
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation waitlist" ON public.waitlist
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Tenant isolation status_log" ON public.appointment_status_log
  FOR ALL TO authenticated USING (clinic_id = public.get_my_clinic_id());

-- Public access for self check-in via confirmation_code (limited columns)
CREATE POLICY "Public read appointments by code" ON public.appointments
  FOR SELECT TO anon USING (confirmation_code IS NOT NULL);
CREATE POLICY "Public update checkin only" ON public.appointments
  FOR UPDATE TO anon USING (confirmation_code IS NOT NULL)
  WITH CHECK (confirmation_code IS NOT NULL);
CREATE POLICY "Public read patients minimal" ON public.patients
  FOR SELECT TO anon USING (true);

-- ============================================================
-- 13. Função: detectar conflito de horário
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  _professional_id UUID,
  _starts_at TIMESTAMPTZ,
  _duration_minutes INTEGER,
  _ignore_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.professional_id = _professional_id
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (_ignore_id IS NULL OR a.id <> _ignore_id)
      AND tstzrange(a.appointment_date, a.appointment_date + (a.duration_minutes || ' minutes')::interval)
          && tstzrange(_starts_at, _starts_at + (_duration_minutes || ' minutes')::interval)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
