import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { NovoAgendamentoModal } from "@/components/NovoAgendamentoModal";
import { toast } from "sonner";

export const Route = createFileRoute("/app/agendamentos")({
  component: AgendamentosSemana,
});

const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_HEIGHT = 96; // 6rem
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

const DAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  in_progress: "bg-amber-500/25 text-amber-200 border-amber-500/40",
  completed: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  cancelled: "bg-rose-500/15 text-rose-300/80 border-rose-500/30 line-through opacity-70",
  no_show: "bg-rose-500/15 text-rose-300/80 border-rose-500/30 line-through opacity-70",
};

type Appointment = {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  type: string | null;
  patients: { full_name: string } | null;
  profiles: { full_name: string } | null;
};

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // make Monday start
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtRange(start: Date) {
  const end = addDays(start, 4);
  const m = start.toLocaleDateString("pt-BR", { month: "short" });
  return `${start.getDate()}–${end.getDate()} ${m} ${start.getFullYear()}`;
}

function AgendamentosSemana() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedProf, setSelectedProf] = useState<string>("all");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);

  const days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    []
  );

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [weekStart, selectedProf]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["admin", "professional"]);
    setProfiles(data || []);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const from = weekStart.toISOString();
    const to = addDays(weekStart, 5).toISOString();

    let query = supabase
      .from("appointments")
      .select(
        "id, appointment_date, duration_minutes, status, type, patients(full_name), profiles(full_name)"
      )
      .gte("appointment_date", from)
      .lt("appointment_date", to)
      .order("appointment_date", { ascending: true });

    if (selectedProf !== "all") query = query.eq("professional_id", selectedProf);

    const { data, error } = await query;
    if (error) toast.error("Erro ao carregar agenda: " + error.message);
    setAppointments((data as any) || []);
    setLoading(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const placedAppointments = appointments
    .map((apt) => {
      const d = new Date(apt.appointment_date);
      const dayIndex = days.findIndex(
        (day) =>
          day.getFullYear() === d.getFullYear() &&
          day.getMonth() === d.getMonth() &&
          day.getDate() === d.getDate()
      );
      if (dayIndex === -1) return null;
      const minutesFromStart = (d.getHours() - HOUR_START) * 60 + d.getMinutes();
      if (minutesFromStart < 0) return null;
      const top = minutesFromStart * MINUTE_HEIGHT;
      const height = Math.max(28, apt.duration_minutes * MINUTE_HEIGHT - 4);
      return { apt, dayIndex, top, height };
    })
    .filter(Boolean) as Array<{ apt: Appointment; dayIndex: number; top: number; height: number }>;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border relative">
      <NovoAgendamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
      />

      {/* Header */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-xl font-medium font-display text-foreground min-w-[170px] text-center capitalize">
            {fmtRange(weekStart)}
          </h2>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="ml-2 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-3">
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-5 py-2 rounded-lg font-medium hover:bg-blue-600/30 transition-colors"
          >
            <Plus className="size-4" />
            <span>Novo agendamento</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-2 overflow-x-auto">
        <span className="text-sm text-muted-foreground mr-1 shrink-0">Profissional:</span>
        <button
          onClick={() => setSelectedProf("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
            selectedProf === "all"
              ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
              : "border-border hover:bg-secondary"
          }`}
        >
          Todos
        </button>
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProf(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              selectedProf === p.id
                ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
                : "border-border hover:bg-secondary"
            }`}
          >
            {p.full_name}
          </button>
        ))}
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto bg-background/50 flex">
        {/* Time Column */}
        <div className="w-16 border-r border-border shrink-0 bg-card/50 flex flex-col pt-16">
          {hours.map((h) => (
            <div
              key={h}
              className="border-b border-border/50 flex justify-center relative"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="text-[11px] font-medium text-muted-foreground absolute -top-2 bg-background/80 px-1">
                {String(h).padStart(2, "0")}h
              </span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 flex flex-col min-w-[800px]">
          {/* Days Header */}
          <div className="h-16 flex border-b border-border bg-card/50">
            {days.map((d) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div
                  key={d.toISOString()}
                  className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-r-0"
                >
                  <span className="text-[11px] font-medium text-muted-foreground tracking-wider mb-1">
                    {DAY_NAMES[d.getDay()]}
                  </span>
                  <span
                    className={`text-xl font-medium ${
                      isToday
                        ? "text-blue-400 bg-blue-500/10 size-8 rounded-full flex items-center justify-center border border-blue-500/30"
                        : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Content */}
          <div className="flex-1 flex relative">
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className="flex-1 border-r border-border/50 last:border-r-0 relative"
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="border-b border-border/20"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
              </div>
            ))}

            {/* Appointment blocks */}
            {placedAppointments.map(({ apt, dayIndex, top, height }) => (
              <div
                key={apt.id}
                className={`absolute rounded-md p-2 border text-left flex flex-col cursor-pointer hover:brightness-110 transition-all ${
                  STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled
                }`}
                style={{
                  left: `calc(${(dayIndex / days.length) * 100}% + 4px)`,
                  width: `calc(${100 / days.length}% - 8px)`,
                  top,
                  height,
                }}
                title={`${apt.patients?.full_name ?? "Paciente"} · ${apt.type ?? ""}`}
              >
                <span className="text-sm font-bold truncate leading-tight">
                  {apt.patients?.full_name ?? "Paciente"}
                </span>
                <span className="text-[11px] opacity-80 mt-0.5 truncate leading-tight">
                  {apt.type ?? "Consulta"}
                </span>
                {height > 56 && apt.profiles?.full_name && (
                  <span className="text-[10px] opacity-60 mt-auto truncate">
                    {apt.profiles.full_name}
                  </span>
                )}
              </div>
            ))}

            {placedAppointments.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground bg-background/70 px-4 py-2 rounded-lg border border-border/50">
                  Nenhum agendamento nesta semana
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
