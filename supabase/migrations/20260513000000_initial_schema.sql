-- Initial Schema for ClinicPro (MedFlow)

-- 1. Create Profiles table (extends auth.users for professionals/admins)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professional', 'receptionist')),
  full_name TEXT NOT NULL,
  specialty TEXT,
  document_number TEXT, -- CRM, CRO, etc.
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  gender TEXT,
  address JSONB,
  notes TEXT, -- General medical/crm notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  type TEXT, -- e.g., 'first_visit', 'return', 'procedure'
  notes TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Profiles: Users can read all profiles (to see other staff), but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Patients: Authenticated users can do everything for now
CREATE POLICY "Authenticated users can manage patients" ON public.patients FOR ALL USING (auth.role() = 'authenticated');

-- Appointments: Authenticated users can manage appointments
CREATE POLICY "Authenticated users can manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
