import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface NovoAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoAgendamentoModal({ isOpen, onClose, onSuccess }: NovoAgendamentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Form state
  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Primeira Consulta");
  
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [ptsResponse, profsResponse] = await Promise.all([
      supabase.from("patients").select("id, full_name").order("full_name"),
      supabase.from("profiles").select("id, full_name, specialty").in("role", ["admin", "professional"])
    ]);
    
    if (ptsResponse.data) setPatients(ptsResponse.data);
    if (profsResponse.data) setProfiles(profsResponse.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !professionalId || !date || !time) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    
    // Convert date + time to ISO string
    const appointmentDate = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await supabase.from("appointments").insert({
      patient_id: patientId,
      professional_id: professionalId,
      appointment_date: appointmentDate,
      duration_minutes: 30, // Padrão
      status: "scheduled",
      type: type
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao agendar consulta: " + error.message);
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
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="agendamento-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Paciente */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="size-4 text-brand" /> Paciente
              </label>
              <select 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
              >
                <option value="">Selecione um paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            {/* Profissional */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-brand" /> Profissional
              </label>
              <select 
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
              >
                <option value="">Selecione o profissional...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.specialty || "Clínico Geral"})</option>
                ))}
              </select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-brand" /> Data
                </label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none color-scheme-dark"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-brand" /> Horário
                </label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none color-scheme-dark"
                />
              </div>
            </div>

            {/* Tipo de Procedimento */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Procedimento</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
              >
                <option>Primeira Consulta</option>
                <option>Retorno</option>
                <option>Procedimento Estético</option>
                <option>Avaliação</option>
                <option>Exame</option>
              </select>
            </div>
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
            disabled={loading}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
