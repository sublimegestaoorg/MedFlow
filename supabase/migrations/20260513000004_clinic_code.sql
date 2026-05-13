ALTER TABLE public.clinics ADD COLUMN code TEXT UNIQUE;

-- Garante que a primeira clínica tenha um código padrão
UPDATE public.clinics SET code = 'sublime' WHERE name = 'Clínica Sublime Matriz';

-- Cria política para permitir que o dono da clínica consiga ler os dados dela (já cobrimos isso, mas vamos garantir)
CREATE POLICY "Tenant isolation for clinics" ON public.clinics 
  FOR ALL USING (id = public.get_my_clinic_id());
