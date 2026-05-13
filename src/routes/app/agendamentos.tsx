import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/app/agendamentos")({
  component: AgendamentosSemana,
});

const weekDays = [
  { name: "SEG", day: "12" },
  { name: "TER", day: "13", active: true },
  { name: "QUA", day: "14" },
  { name: "QUI", day: "15" },
  { name: "SEX", day: "16" },
];

const hours = ["08h", "09h", "10h", "11h", "12h", "13h", "14h", "15h"];

const appointments = [
  // SEG 12
  { col: 1, top: 0, height: 1, name: "Maria S.", proc: "Limpeza", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { col: 1, top: 1, height: 1, name: "João P.", proc: "Consulta", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { col: 1, top: 3.5, height: 1, name: "Roberto A.", proc: "Retorno", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { col: 1, top: 6.5, height: 1, name: "Carla M.", proc: "Avaliação", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  // TER 13
  { col: 2, top: 0, height: 1, name: "Paula R.", proc: "Botox s.2", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { col: 2, top: 1.5, height: 2, name: "Fernando L.", proc: "Canal", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { col: 2, top: 5.5, height: 1, name: "Ana C.", proc: "Revisão", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  // QUA 14
  { col: 3, top: 1, height: 1, name: "Marta S.", proc: "Preenchimento", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { col: 3, top: 3.5, height: 1, name: "Bruno K.", proc: "Consulta", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { col: 3, top: 6, height: 1, name: "Juliana P.", proc: "Retorno", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  // QUI 15
  { col: 4, top: 0, height: 1.5, name: "Sérgio T.", proc: "Avaliação", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { col: 4, top: 3.5, height: 1, name: "Lena F.", proc: "Limpeza", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { col: 4, top: 5.5, height: 1, name: "Davi M.", proc: "Canal", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  // SEX 16
  { col: 5, top: 1, height: 1, name: "Cíntia A.", proc: "Botox s.1", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { col: 5, top: 4.5, height: 1, name: "Pedro H.", proc: "Consulta", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
];

function AgendamentosSemana() {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border">
      {/* Header & Controls */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-xl font-medium font-display text-foreground min-w-[150px] text-center">
            12–16 mai 2026
          </h2>
          <button className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-background border border-border rounded-lg p-1">
            <button className="px-5 py-1.5 text-sm font-medium bg-card rounded-md shadow-sm border border-border/50">Semana</button>
            <button className="px-5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Dia</button>
          </div>
          <button className="flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-lg font-medium hover:bg-blue-600/30 transition-colors">
            <Plus className="size-4" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3 overflow-x-auto">
        <span className="text-sm text-muted-foreground mr-2">Profissional:</span>
        <button className="px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm font-medium whitespace-nowrap">Todos</button>
        <button className="px-4 py-1.5 rounded-full border border-border hover:bg-secondary text-sm font-medium whitespace-nowrap transition-colors">Dra. Ana</button>
        <button className="px-4 py-1.5 rounded-full border border-border hover:bg-secondary text-sm font-medium whitespace-nowrap transition-colors">Dr. Carlos</button>
        <button className="px-4 py-1.5 rounded-full border border-border hover:bg-secondary text-sm font-medium whitespace-nowrap transition-colors">Dra. Lúcia</button>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto bg-background/50 flex">
        {/* Time Column */}
        <div className="w-16 border-r border-border shrink-0 bg-card/50 flex flex-col pt-16">
          {hours.map((hour) => (
            <div key={hour} className="h-24 border-b border-border/50 flex justify-center py-2 relative">
              <span className="text-[11px] font-medium text-muted-foreground absolute -top-2.5 bg-background/50 px-1">{hour}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 flex flex-col min-w-[800px]">
          {/* Days Header */}
          <div className="h-16 flex border-b border-border bg-card/50">
            {weekDays.map((day) => (
              <div key={day.name} className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-r-0">
                <span className="text-[11px] font-medium text-muted-foreground tracking-wider mb-1">{day.name}</span>
                <span className={`text-xl font-medium ${day.active ? 'text-blue-400 bg-blue-500/10 size-8 rounded-full flex items-center justify-center border border-blue-500/20' : 'text-foreground'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 flex relative">
            {/* Background Grid Lines */}
            {weekDays.map((_, i) => (
              <div key={i} className="flex-1 border-r border-border/50 last:border-r-0 relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-24 border-b border-border/10" />
                ))}
              </div>
            ))}

            {/* Appointment Blocks */}
            {appointments.map((apt, idx) => (
              <div 
                key={idx} 
                className={`absolute rounded-md p-2 border ${apt.color} flex flex-col cursor-pointer hover:brightness-110 transition-all`}
                style={{
                  left: `calc(${(apt.col - 1) * 20}% + 4px)`,
                  width: `calc(20% - 8px)`,
                  top: `${apt.top * 6}rem`, // 6rem = h-24
                  height: `${apt.height * 6}rem`,
                  marginTop: '4px',
                  marginBottom: '4px'
                }}
              >
                <span className="text-sm font-bold truncate leading-tight">{apt.name}</span>
                <span className="text-[11px] opacity-80 mt-0.5 truncate leading-tight">{apt.proc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
