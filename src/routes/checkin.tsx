import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2, HeartPulse, AlertCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
});

type Found = {
  id: string;
  appointment_date: string;
  status: string;
  duration_minutes: number;
  checked_in_at: string | null;
  patients: { full_name: string } | null;
  profiles: { full_name: string; specialty: string | null } | null;
};

function CheckinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appt, setAppt] = useState<Found | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAppt(null);
    setDone(false);
    setLoading(true);
    const clean = code.trim().toLowerCase();
    if (!clean) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, status, duration_minutes, checked_in_at, patients(full_name), profiles!appointments_professional_id_fkey(full_name, specialty)")
      .eq("confirmation_code", clean)
      .maybeSingle();

    setLoading(false);
    if (error || !data) {
      setError("Código não encontrado. Confira com a recepção.");
      return;
    }
    setAppt(data as unknown as Found);
  };

  const confirm = async () => {
    if (!appt) return;
    setLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({ checked_in_at: new Date().toISOString(), status: "confirmed" })
      .eq("id", appt.id);
    setLoading(false);
    if (error) {
      setError("Não foi possível concluir o check-in. Procure a recepção.");
      return;
    }
    setDone(true);
  };

  const dt = appt ? new Date(appt.appointment_date) : null;

  return (
    <div className="dark min-h-screen bg-background text-foreground grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="size-12 bg-brand rounded-2xl grid place-items-center mb-4">
            <HeartPulse className="size-6 text-brand-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Check-in</h1>
          <p className="text-sm text-muted-foreground mt-1">Confirme sua chegada na clínica</p>
        </div>

        {!appt && !done && (
          <form onSubmit={search} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código de confirmação</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex.: a1b2c3d4"
                className="w-full mt-2 bg-secondary border border-border rounded-lg px-4 py-3 font-mono uppercase tracking-widest text-center text-lg focus:outline-none focus:border-brand"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">Você recebeu este código na confirmação do agendamento.</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-brand text-brand-foreground font-bold py-3 rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Buscar"}
            </button>
          </form>
        )}

        {appt && !done && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Paciente</div>
              <div className="text-lg font-bold">{appt.patients?.full_name ?? "—"}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Profissional</div>
                <div className="font-semibold">{appt.profiles?.full_name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{appt.profiles?.specialty ?? ""}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Horário</div>
                <div className="font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {dt?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dt?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}
                </div>
              </div>
            </div>

            {appt.checked_in_at ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <CheckCircle2 className="size-4" />
                Check-in já realizado às {new Date(appt.checked_in_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            ) : (
              <button
                onClick={confirm}
                disabled={loading}
                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> Confirmar minha chegada</>}
              </button>
            )}

            <button onClick={() => { setAppt(null); setCode(""); }} className="w-full text-xs text-muted-foreground hover:text-foreground">
              ← Buscar outro código
            </button>
          </div>
        )}

        {done && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="size-16 bg-emerald-500 rounded-full grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-emerald-300">Tudo certo!</h2>
            <p className="text-sm text-muted-foreground mt-2">A recepção já foi avisada da sua chegada. Aguarde ser chamado.</p>
            <button
              onClick={() => { setDone(false); setAppt(null); setCode(""); }}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground"
            >
              Novo check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
