import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Loader2, Search, Calendar as CalendarIcon, Ban, Flame } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { NovoAgendamentoModal, type AgendamentoPrefill } from "@/components/NovoAgendamentoModal";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/agendamentos")({
  component: AgendamentosPage,
});

const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_HEIGHT = 96;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const SLOT_MINUTES = 30;
const DAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/20 text-blue-200 border-blue-500/40",
  confirmed: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  in_progress: "bg-amber-500/25 text-amber-100 border-amber-500/40",
  completed: "bg-slate-500/25 text-slate-200 border-slate-500/40",
  cancelled: "bg-rose-500/15 text-rose-200/80 border-rose-500/30 line-through opacity-70",
  no_show: "bg-rose-500/15 text-rose-200/80 border-rose-500/30 line-through opacity-70",
};

type Appointment = {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  type: string | null;
  professional_id: string | null;
  patients: { id: string; full_name: string } | null;
  profiles: { full_name: string; specialty: string | null } | null;
};

type TimeBlock = {
  id: string;
  professional_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string;
};

type Professional = { id: string; full_name: string; specialty: string | null };

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function fmtRange(start: Date) {
  const end = addDays(start, 4);
  const m = start.toLocaleDateString("pt-BR", { month: "short" });
  return `${start.getDate()}–${end.getDate()} ${m} ${start.getFullYear()}`;
}
function fmtDay(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}
function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}
function profColor(id: string) {
  let hash = 0; for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const palette = ["emerald", "blue", "violet", "amber", "rose", "cyan", "indigo"];
  return palette[hash % palette.length];
}
function toDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toTimeInput(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function AgendamentosPage() {
  const [view, setView] = useState<"week" | "day">("week");
  const [date, setDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<AgendamentoPrefill | undefined>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProf, setSelectedProf] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const weekStart = useMemo(() => startOfWeek(date), [date]);
  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const hours = useMemo(() => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i), []);

  useEffect(() => { fetchProfessionals(); }, []);
  useEffect(() => { fetchAppointments(); }, [view, date, selectedProf]);

  const fetchProfessionals = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, specialty")
      .in("role", ["admin", "owner", "professional"]);
    setProfessionals((data as any) || []);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const from = view === "week" ? weekStart : startOfDay(date);
    const to = view === "week" ? addDays(weekStart, 5) : addDays(startOfDay(date), 1);
    let q = supabase.from("appointments")
      .select("id, appointment_date, duration_minutes, status, type, professional_id, patients(id, full_name), profiles(full_name, specialty)")
      .gte("appointment_date", from.toISOString())
      .lt("appointment_date", to.toISOString())
      .order("appointment_date", { ascending: true });
    if (selectedProf !== "all") q = q.eq("professional_id", selectedProf);

    let bq = supabase.from("time_blocks")
      .select("id, professional_id, starts_at, ends_at, reason")
      .lt("starts_at", to.toISOString())
      .gte("ends_at", from.toISOString());
    if (selectedProf !== "all") bq = bq.eq("professional_id", selectedProf);

    const [aRes, bRes] = await Promise.all([q, bq]);
    if (aRes.error) toast.error("Erro ao carregar agenda: " + aRes.error.message);
    setAppointments((aRes.data as any) || []);
    setBlocks((bRes.data as any) || []);
    setLoading(false);
  };

  const filteredAppointments = appointments.filter((a) =>
    !search || (a.patients?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const today = startOfDay(new Date());
  const stepBack = () => setDate(addDays(date, view === "week" ? -7 : -1));
  const stepFwd = () => setDate(addDays(date, view === "week" ? 7 : 1));

  const openSlot = (cellDate: Date, hour: number, minute: number, professionalId?: string) => {
    setPrefill({
      date: toDateInput(cellDate),
      time: toTimeInput(hour, minute),
      professionalId: professionalId || (selectedProf !== "all" ? selectedProf : undefined),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border relative">
      <NovoAgendamentoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setPrefill(undefined); }}
        onSuccess={fetchAppointments}
        prefill={prefill}
      />

      {/* Top bar */}
      <div className="p-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={stepBack} className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronLeft className="size-4" />
          </button>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary text-sm font-medium font-display capitalize min-w-[220px] justify-center">
                <CalendarIcon className="size-4 text-brand" />
                {view === "week" ? fmtRange(weekStart) : fmtDay(date)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePicker
                mode="single"
                selected={date}
                onSelect={(d) => { if (d) { setDate(d); setDatePopoverOpen(false); } }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <button onClick={stepFwd} className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronRight className="size-4" />
          </button>
          <button onClick={() => setDate(new Date())} className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            Hoje
          </button>
          <div className="flex bg-background border border-border rounded-lg p-1 ml-2">
            <button
              onClick={() => setView("week")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === "week" ? "bg-card border border-border/50 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >Semana</button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === "day" ? "bg-card border border-border/50 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >Dia</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <button
            onClick={() => { setPrefill(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo agendamento</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-2 overflow-x-auto">
        <span className="text-sm text-muted-foreground mr-1 shrink-0">Profissional:</span>
        <Chip active={selectedProf === "all"} onClick={() => setSelectedProf("all")}>Todos</Chip>
        {professionals.map((p) => (
          <Chip key={p.id} active={selectedProf === p.id} onClick={() => setSelectedProf(p.id)}>{p.full_name.split(" ")[0]}</Chip>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-background/50">
        {view === "week"
          ? <WeekView days={days} hours={hours} appointments={filteredAppointments} blocks={blocks} today={today} onSlotClick={openSlot} />
          : <DayProfessionalsView date={date} hours={hours} appointments={filteredAppointments} blocks={blocks} professionals={professionals} onSlotClick={openSlot} />
        }
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${active ? "bg-brand/20 text-brand border-brand/30" : "border-border hover:bg-secondary"}`}>{children}</button>
  );
}

/* ------------- Week view ------------- */
function WeekView({
  days, hours, appointments, blocks, today, onSlotClick,
}: {
  days: Date[]; hours: number[]; appointments: Appointment[]; blocks: TimeBlock[]; today: Date;
  onSlotClick: (date: Date, hour: number, minute: number) => void;
}) {
  const placed = appointments.map((apt) => {
    const d = new Date(apt.appointment_date);
    const dayIndex = days.findIndex((day) => day.toDateString() === d.toDateString());
    if (dayIndex === -1) return null;
    const minutesFromStart = (d.getHours() - HOUR_START) * 60 + d.getMinutes();
    if (minutesFromStart < 0) return null;
    return { apt, dayIndex, top: minutesFromStart * MINUTE_HEIGHT, height: Math.max(28, apt.duration_minutes * MINUTE_HEIGHT - 4) };
  }).filter(Boolean) as Array<{ apt: Appointment; dayIndex: number; top: number; height: number }>;

  const placedBlocks = blocks.flatMap((b) => {
    const s = new Date(b.starts_at);
    const e = new Date(b.ends_at);
    return days.map((day, dayIndex) => {
      if (e <= startOfDay(day) || s >= addDays(startOfDay(day), 1)) return null;
      const dayStart = new Date(day); dayStart.setHours(HOUR_START, 0, 0, 0);
      const dayEnd = new Date(day); dayEnd.setHours(HOUR_END, 0, 0, 0);
      const blockStart = s < dayStart ? dayStart : s;
      const blockEnd = e > dayEnd ? dayEnd : e;
      if (blockEnd <= blockStart) return null;
      const top = ((blockStart.getHours() - HOUR_START) * 60 + blockStart.getMinutes()) * MINUTE_HEIGHT;
      const height = ((blockEnd.getTime() - blockStart.getTime()) / 60000) * MINUTE_HEIGHT;
      return { b, dayIndex, top, height };
    }).filter(Boolean) as Array<{ b: TimeBlock; dayIndex: number; top: number; height: number }>;
  });

  return (
    <div className="flex">
      <div className="w-16 border-r border-border shrink-0 bg-card/50 flex flex-col pt-16">
        {hours.map((h) => (
          <div key={h} className="border-b border-border/50 flex justify-center relative" style={{ height: HOUR_HEIGHT }}>
            <span className="text-[11px] font-medium text-muted-foreground absolute -top-2 bg-background/80 px-1">{String(h).padStart(2, "0")}h</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-[800px]">
        <div className="h-16 flex border-b border-border bg-card/50">
          {days.map((d) => {
            const isToday = d.getTime() === today.getTime();
            return (
              <div key={d.toISOString()} className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-r-0">
                <span className="text-[11px] font-medium text-muted-foreground tracking-wider mb-1">{DAY_NAMES[d.getDay()]}</span>
                <span className={`text-xl font-medium ${isToday ? "text-brand bg-brand/10 size-8 rounded-full flex items-center justify-center border border-brand/30" : "text-foreground"}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="flex relative">
          {days.map((d, dayIndex) => (
            <div key={d.toISOString()} className="flex-1 border-r border-border/50 last:border-r-0 relative">
              {hours.map((h) => (
                <div key={h} className="border-b border-border/20 relative" style={{ height: HOUR_HEIGHT }}>
                  {/* 30-min click zones */}
                  <button
                    type="button"
                    onClick={() => onSlotClick(d, h, 0)}
                    className="absolute inset-x-0 top-0 hover:bg-brand/5 transition-colors"
                    style={{ height: HOUR_HEIGHT / 2 }}
                    aria-label={`Agendar ${toTimeInput(h, 0)}`}
                  />
                  <button
                    type="button"
                    onClick={() => onSlotClick(d, h, SLOT_MINUTES)}
                    className="absolute inset-x-0 hover:bg-brand/5 transition-colors"
                    style={{ top: HOUR_HEIGHT / 2, height: HOUR_HEIGHT / 2 }}
                    aria-label={`Agendar ${toTimeInput(h, SLOT_MINUTES)}`}
                  />
                </div>
              ))}
              {/* Time blocks (per column) */}
              {placedBlocks.filter((pb) => pb.dayIndex === dayIndex).map(({ b, top, height }) => (
                <div
                  key={`${b.id}-${dayIndex}`}
                  className="absolute inset-x-1 rounded-md border border-border bg-[repeating-linear-gradient(45deg,_hsl(var(--muted)),_hsl(var(--muted))_6px,_transparent_6px,_transparent_12px)] flex items-center justify-center px-2 pointer-events-none"
                  style={{ top, height }}
                  title={b.reason}
                >
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <Ban className="size-3" /> {b.reason}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {placed.map(({ apt, dayIndex, top, height }) => (
            <Link
              to="/app/pacientes/$id"
              params={{ id: apt.patients?.id || "" }}
              key={apt.id}
              className={`absolute rounded-md p-2 border flex flex-col cursor-pointer hover:brightness-110 transition-all ${STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled}`}
              style={{ left: `calc(${(dayIndex / days.length) * 100}% + 4px)`, width: `calc(${100 / days.length}% - 8px)`, top, height }}
            >
              <span className="text-sm font-bold truncate leading-tight">{apt.patients?.full_name ?? "Paciente"}</span>
              <span className="text-[11px] opacity-80 mt-0.5 truncate leading-tight">{apt.type ?? "Consulta"}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------- Day-by-professional view ------------- */
function DayProfessionalsView({
  date, hours, appointments, blocks, professionals, onSlotClick,
}: {
  date: Date; hours: number[]; appointments: Appointment[]; blocks: TimeBlock[]; professionals: Professional[];
  onSlotClick: (date: Date, hour: number, minute: number, professionalId?: string) => void;
}) {
  if (professionals.length === 0) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Nenhum profissional cadastrado.</div>;
  }

  const placed = appointments.map((apt) => {
    const d = new Date(apt.appointment_date);
    const profIdx = professionals.findIndex((p) => p.id === apt.professional_id);
    if (profIdx === -1) return null;
    const minutesFromStart = (d.getHours() - HOUR_START) * 60 + d.getMinutes();
    if (minutesFromStart < 0) return null;
    return { apt, profIdx, top: minutesFromStart * MINUTE_HEIGHT, height: Math.max(28, apt.duration_minutes * MINUTE_HEIGHT - 4) };
  }).filter(Boolean) as Array<{ apt: Appointment; profIdx: number; top: number; height: number }>;

  return (
    <div className="flex">
      <div className="w-16 border-r border-border shrink-0 bg-card/50 flex flex-col pt-24">
        {hours.map((h) => (
          <div key={h} className="border-b border-border/50 flex justify-center relative" style={{ height: HOUR_HEIGHT }}>
            <span className="text-[11px] font-medium text-muted-foreground absolute -top-2 bg-background/80 px-1">{String(h).padStart(2, "0")}h</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col" style={{ minWidth: Math.max(800, professionals.length * 220) }}>
        <div className="h-24 flex border-b border-border bg-card/50">
          {professionals.map((p) => {
            const c = profColor(p.id);
            return (
              <div key={p.id} className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-r-0 px-3 text-center">
                <div className={`size-9 rounded-full bg-${c}-500/20 text-${c}-300 border border-${c}-500/30 flex items-center justify-center font-bold text-sm mb-1`}>
                  {initials(p.full_name)}
                </div>
                <span className="text-sm font-bold leading-tight">{p.full_name}</span>
                <span className="text-[11px] text-muted-foreground">{p.specialty || "—"}</span>
              </div>
            );
          })}
        </div>
        <div className="flex relative">
          {professionals.map((p, profIdx) => (
            <div key={p.id} className="flex-1 border-r border-border/50 last:border-r-0 relative" style={{ minWidth: 220 }}>
              {hours.map((h) => (
                <div key={h} className="border-b border-border/20 relative" style={{ height: HOUR_HEIGHT }}>
                  <button type="button" onClick={() => onSlotClick(date, h, 0, p.id)} className="absolute inset-x-0 top-0 hover:bg-brand/5" style={{ height: HOUR_HEIGHT / 2 }} />
                  <button type="button" onClick={() => onSlotClick(date, h, SLOT_MINUTES, p.id)} className="absolute inset-x-0 hover:bg-brand/5" style={{ top: HOUR_HEIGHT / 2, height: HOUR_HEIGHT / 2 }} />
                </div>
              ))}
              {/* Blocks for this professional */}
              {blocks.filter((b) => b.professional_id === p.id).map((b) => {
                const s = new Date(b.starts_at);
                const e = new Date(b.ends_at);
                const dayStart = new Date(date); dayStart.setHours(HOUR_START, 0, 0, 0);
                const dayEnd = new Date(date); dayEnd.setHours(HOUR_END, 0, 0, 0);
                if (e <= dayStart || s >= dayEnd) return null;
                const bs = s < dayStart ? dayStart : s;
                const be = e > dayEnd ? dayEnd : e;
                const top = ((bs.getHours() - HOUR_START) * 60 + bs.getMinutes()) * MINUTE_HEIGHT;
                const height = ((be.getTime() - bs.getTime()) / 60000) * MINUTE_HEIGHT;
                return (
                  <div
                    key={b.id}
                    className="absolute inset-x-1 rounded-md border border-border bg-[repeating-linear-gradient(45deg,_hsl(var(--muted)),_hsl(var(--muted))_6px,_transparent_6px,_transparent_12px)] flex items-center justify-center px-2 pointer-events-none"
                    style={{ top, height }}
                    title={b.reason}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Ban className="size-3" /> {b.reason}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {placed.map(({ apt, profIdx, top, height }) => (
            <Link
              to="/app/pacientes/$id"
              params={{ id: apt.patients?.id || "" }}
              key={apt.id}
              className={`absolute rounded-md p-2 border flex flex-col cursor-pointer hover:brightness-110 transition-all ${STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled}`}
              style={{ left: `calc(${(profIdx / professionals.length) * 100}% + 4px)`, width: `calc(${100 / professionals.length}% - 8px)`, top, height }}
            >
              <span className="text-sm font-bold truncate leading-tight">{apt.patients?.full_name ?? "Paciente"}</span>
              <span className="text-[11px] opacity-80 mt-0.5 truncate leading-tight">{apt.type ?? "Consulta"}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
