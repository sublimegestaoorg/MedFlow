REVOKE EXECUTE ON FUNCTION public.get_my_clinic_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_clinic_id_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_appointment_conflict(UUID, TIMESTAMPTZ, INTEGER, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_appointment_conflict(UUID, TIMESTAMPTZ, INTEGER, UUID) TO authenticated;