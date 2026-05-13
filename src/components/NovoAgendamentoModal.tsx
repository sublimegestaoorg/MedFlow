import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, Loader2, AlertTriangle, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type AgendamentoPrefill = {
  date?: string;            // YYYY-MM-DD
  time?: string;            // HH:mm
  professionalId?: string;
};

interface NovoAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefill?: AgendamentoPrefill;
}

type Patient = { id: string; full_name: string };
type Profile = { id: string; full_name: string; specialty: string | null };
type Procedure = {
  id: string;
  name: string;
  duration_minutes: number;
  base_price: number;
  active: boolean;
};

export function NovoAgendamentoModal({
  isOpen,
  onClose,
  onSuccess,
  prefill,
}: NovoAgendamentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState("Primeira Consulta");
  const [conflict, setConflict] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
    setPatientId("");
    setProcedureId("");
    setType("Primeira Consulta");
    setDuration(30);
    setConflict(false);
    setDate(prefill?.date ?? "");
    setTime(prefill?.time ?? "");
    setProfessionalId(prefill?.professionalId ?? "");
  }, [isOpen, prefill?.date, prefill?.time, prefill?.professionalId]);

  // Live conflict check
  useEffect(() => {
    if (!isOpen || !professionalId || !date || !time) {
      setConflict(false);
      return;
    }
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    let cancelled = false;
    setCheckingConflict(true);
    supabase
      .rpc("check_appointment_conflict", {
        _professional_id: professionalId,
        _starts_at: startsAt,
        _duration_minutes: duration,
        _ignore_id: undefined,
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setConflict(false);
        } else {
          setConflict(Boolean(data));
        }
        setCheckingConflict(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, professionalId, date, time, duration]);

  const loadData = async () => {
    const [pts, profs, procs] = await Promise.all([
      supabase.from("patients").select("id, full_name").order("full_name"),
      supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .in("role", ["admin", "owner", "professional"]),
      supabase
        .from("procedures")
        .select("id, name, duration_minutes, base_price, active")
        .eq("active", true)
        .order("name"),
    ]);

    if (pts.data) setPatients(pts.data as Patient[]);
    if (profs.data) setProfiles(profs.data as Profile[]);
    if (procs.data) setProcedures(procs.data as Procedure[]);
  };

  const handleProcedureChange = (id: string) => {
    setProcedureId(id);
    const p = procedures.find((x) => x.id === id);
    if (p) {
      setDuration(p.duration_minutes);
      setType(p.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !professionalId || !date || !time) {
      toast.error("Preencha paciente, profissional, data e horário.");
      return;
    }
    if (conflict) {
      toast.error("Horário em conflito com outro agendamento deste profissional.");
      return;
    }

    setLoading(true);
    const appointmentDate = new Date(`${date}T${time}:00`).toISOString();

    // Final server-side check (in case state is stale)
    const { data: hasConflict } = await supabase.rpc("check_appointment_conflict", {
      _professional_id: professionalId,
      _starts_at: appointmentDate,
      _duration_minutes: duration,
      _ignore_id: undefined,
    });
    if (hasConflict) {
      setConflict(true);
      setLoading(false);
      toast.error("Horário em conflito.");
      return;
    }

    // Resolve clinic_id
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      toast.error("Sessão expirada.");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", auth.user.id)
      .single();
    if (!profile?.clinic_id) {
      setLoading(false);
      toast.error("Sua conta não está vinculada a uma clínica.");
      return;
    }

    const proc = procedures.find((p) => p.id === procedureId);
    const { error } = await supabase.from("appointments").insert({
      patient_id: patientId,
      professional_id: professionalId,
      procedure_id: procedureId || null,
      appointment_date: appointmentDate,
      duration_minutes: duration,
      status: "scheduled",
      type,
      price: proc?.base_price ?? null,
      clinic_id: profile.clinic_id,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao agendar: " + error.message);
      return;
    }

    toast.success("Consulta agendada com sucesso!");
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="text-xl font-bold font-display text-foreground">Novo Agendamento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="agendamento-form" onSubmit={handleSubmit} className="space-y-5">
            <Field icon={User} label="Paciente">
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="select"
              >
                <option value="">Selecione um paciente…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={FileText} label="Profissional">
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="select"
              >
                <option value="">Selecione o profissional…</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.specialty || "Clínico Geral"})
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={Stethoscope} label="Procedimento">
              <select
                value={procedureId}
                onChange={(e) => handleProcedureChange(e.target.value)}
                className="select"
              >
                <option value="">— Outro / Personalizado —</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.duration_minutes}min · R$ {Number(p.base_price).toFixed(2)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field icon={Calendar} label="Data" colSpan={2}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="select"
                />
              </Field>
              <Field icon={Clock} label="Hora">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="select"
                />
              </Field>
            </div>

            <Field label="Duração (minutos)">
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="select"
              />
            </Field>

            {!procedureId && (
              <Field label="Tipo (livre)">
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="select"
                  placeholder="Ex: Primeira Consulta"
                />
              </Field>
            )}

            {/* Conflict banner */}
            {professionalId && date && time && (
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                  checkingConflict
                    ? "border-border bg-secondary/40 text-muted-foreground"
                    : conflict
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {checkingConflict ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verificando disponibilidade…
                  </>
                ) : conflict ? (
                  <>
                    <AlertTriangle className="size-4" /> Conflito: este profissional já tem
                    agendamento neste horário.
                  </>
                ) : (
                  <>✓ Horário disponível para este profissional.</>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="agendamento-form"
            disabled={loading || conflict || checkingConflict}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>

      <style>{`
        .select {
          width: 100%;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
        }
        .select:focus { box-shadow: 0 0 0 2px color-mix(in oklab, hsl(var(--brand)) 25%, transparent); }
      `}</style>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  colSpan,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <div className={`space-y-1.5 ${colSpan === 2 ? "col-span-2" : ""}`}>
      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
        {Icon && <Icon className="size-4 text-brand" />} {label}
      </label>
      {children}
    </div>
  );
}
