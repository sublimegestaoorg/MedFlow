-- Clinical Notes (Evoluções do Prontuário)
CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'evolution', -- pode ser 'evolution', 'prescription', 'exam'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can manage clinical notes" ON public.clinical_notes FOR ALL USING (auth.role() = 'authenticated');
