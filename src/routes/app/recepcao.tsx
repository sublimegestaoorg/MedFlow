import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Clock, CheckCircle2, PlayCircle, XCircle, Copy, Radio, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/recepcao")({
  component: RecepcaoPage,
});

type Appt = {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  type: string | null;
  room: string | null;
  checked_in_at: string | null;
  confirmation_code: string | null;
  patients: { id: string; full_name: string; phone: string | null } | null;
  profiles: { full_name: string; specialty: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Aguardando",
  in_progress: "Em atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Faltou",
};

const STATUS_TONES: Record<string, string> = {
  scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  confirmed: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  no_show: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function RecepcaoPage() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { start, end } = todayRange();
    const { data } = await supabase
      .from("appointments")
      .select("id, appointment_date, duration_minutes, status, type, room, checked_in_at, confirmation_code, patients(id, full_name, phone), profiles(full_name, specialty)")
      .gte("appointment_date", start)
      .lt("appointment_date", end)
      .order("appointment_date", { ascending: true });
    setAppts((data ?? []) as unknown as Appt[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("recepcao-appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const patch: Record<string, unknown> = { status };
    if (status === "confirmed") patch.checked_in_at = new Date().toISOString();
    const { error } = await supabase.from("appointments").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status atualizado: ${STATUS_LABELS[status]}`);
  };

  const copyCode = (code: string | null) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado.`);
  };

  const checkinUrl = `${window.location.origin}/checkin`;

  const counts = {
    total: appts.length,
    waiting: appts.filter((a) => a.status === "confirmed").length,
    inProgress: appts.filter((a) => a.status === "in_progress").length,
    done: appts.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            Recepção — Hoje
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">Atualizado em tempo real conforme pacientes fazem check-in.</p>
        </div>
        <a href={checkinUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/70 text-sm">
          <Radio className="size-4 text-emerald-400" /> Página pública: {checkinUrl.replace(/^https?:\/\//, "")}
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Hoje" value={counts.total} icon={<Clock className="size-5" />} tone="brand" />
        <Stat label="Aguardando" value={counts.waiting} icon={<UserCheck className="size-5" />} tone="amber" />
        <Stat label="Em atendimento" value={counts.inProgress} icon={<PlayCircle className="size-5" />} tone="violet" />
        <Stat label="Concluídos" value={counts.done} icon={<CheckCircle2 className="size-5" />} tone="emerald" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : appts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Nenhum agendamento para hoje.</div>
      ) : (
        <div className="space-y-3">
          {appts.map((a) => {
            const time = new Date(a.appointment_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const checked = !!a.checked_in_at;
            return (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center gap-4">
                <div className="text-center min-w-16">
                  <div className="font-display text-2xl font-bold">{time}</div>
                  <div className="text-xs text-muted-foreground">{a.duration_minutes}min</div>
                </div>

                <div className="flex-1 min-w-48">
                  <div className="font-bold flex items-center gap-2">
                    {a.patients?.full_name ?? "—"}
                    {checked && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        Chegou {new Date(a.checked_in_at!).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.profiles?.full_name ?? "—"} · {a.type ?? "Consulta"}
                    {a.room ? ` · Sala ${a.room}` : ""}
                  </div>
                </div>

                <button onClick={() => copyCode(a.confirmation_code)}
                  className="font-mono text-xs bg-secondary border border-border px-2.5 py-1.5 rounded-lg hover:bg-secondary/70 flex items-center gap-1.5"
                  title="Copiar código de check-in">
                  <Copy className="size-3" /> {a.confirmation_code ?? "—"}
                </button>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_TONES[a.status] ?? ""}`}>
                  {STATUS_LABELS[a.status] ?? a.status}
                </span>

                <div className="flex items-center gap-1.5 ml-auto">
                  {a.status !== "confirmed" && a.status !== "in_progress" && a.status !== "completed" && (
                    <ActionBtn onClick={() => updateStatus(a.id, "confirmed")} icon={<UserCheck className="size-3.5" />} tone="amber">Check-in</ActionBtn>
                  )}
                  {(a.status === "confirmed" || a.status === "scheduled") && (
                    <ActionBtn onClick={() => updateStatus(a.id, "in_progress")} icon={<PlayCircle className="size-3.5" />} tone="violet">Iniciar</ActionBtn>
                  )}
                  {a.status === "in_progress" && (
                    <ActionBtn onClick={() => updateStatus(a.id, "completed")} icon={<CheckCircle2 className="size-3.5" />} tone="emerald">Concluir</ActionBtn>
                  )}
                  {a.status !== "completed" && a.status !== "cancelled" && (
                    <ActionBtn onClick={() => updateStatus(a.id, "no_show")} icon={<XCircle className="size-3.5" />} tone="rose">Faltou</ActionBtn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    brand: "bg-brand/10 text-brand border-brand/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`size-12 rounded-xl border grid place-items-center ${tones[tone]}`}>{icon}</div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, icon, tone }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    amber: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/30",
    violet: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border-violet-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/30",
    rose: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-rose-500/30",
  };
  return (
    <button onClick={onClick} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${tones[tone]}`}>
      {icon} {children}
    </button>
  );
}
