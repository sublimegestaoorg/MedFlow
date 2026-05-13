
-- Auto-log appointment status changes
CREATE OR REPLACE FUNCTION public.log_appointment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.appointment_status_log (appointment_id, clinic_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NEW.clinic_id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_appointment_status ON public.appointments;
CREATE TRIGGER trg_log_appointment_status
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.log_appointment_status_change();

-- Auto-set clinic_id on insert for waitlist + appointments + procedures + time_blocks + clinical_notes
DROP TRIGGER IF EXISTS trg_set_clinic_waitlist ON public.waitlist;
CREATE TRIGGER trg_set_clinic_waitlist BEFORE INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

DROP TRIGGER IF EXISTS trg_set_clinic_appointments ON public.appointments;
CREATE TRIGGER trg_set_clinic_appointments BEFORE INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_on_insert();

-- Enable realtime for appointments & waitlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.waitlist REPLICA IDENTITY FULL;
