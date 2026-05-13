CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  _professional_id UUID,
  _starts_at TIMESTAMPTZ,
  _duration_minutes INTEGER,
  _ignore_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.professional_id = _professional_id
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (_ignore_id IS NULL OR a.id <> _ignore_id)
      AND tstzrange(a.appointment_date, a.appointment_date + (a.duration_minutes || ' minutes')::interval)
          && tstzrange(_starts_at, _starts_at + (_duration_minutes || ' minutes')::interval)
  );
$$;