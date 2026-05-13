import { createFileRoute } from "@tanstack/react-router";
import { Plus, Bell } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: DashboardOverview,
});

const agenda = [
  { time: "08:00", patient: "Maria Silva", procedure: "Limpeza", color: "bg-emerald-500" },
  { time: "09:00", patient: "João Pereira", procedure: "Consulta geral", color: "bg-blue-500" },
  { time: "10:30", patient: "Paula Ramos", procedure: "Botox — sessão 2", color: "bg-amber-500" },
  { time: "11:00", patient: "Carlos Lima", procedure: "Avaliação", color: "bg-zinc-500" },
  { time: "14:00", patient: "Fernanda Costa", procedure: "Retorno", color: "bg-emerald-500" },
];

const occupation = [
  { name: "Dra. Ana", percentage: 88, color: "bg-emerald-500", width: "88%" },
  { name: "Dr. Carlos", percentage: 72, color: "bg-blue-500", width: "72%" },
  { name: "Dra. Lúcia", percentage: 55, color: "bg-indigo-500", width: "55%" },
  { name: "Dr. Marcos", percentage: 40, color: "bg-amber-500", width: "40%" },
];

function DashboardOverview() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bom dia, Dra. Ana</h1>
          <p className="text-sm text-muted-foreground mt-1">Clínica Sorria — hoje, 13 mai 2026</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 border border-border bg-card hover:bg-secondary px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            <Plus className="size-4" />
            <span>Agendar</span>
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="size-5" />
          </button>
          <div className="size-10 rounded-full bg-blue-900 text-blue-200 font-bold flex items-center justify-center text-sm ml-2">
            DA
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">Consultas hoje</h3>
          <div className="text-3xl font-bold mb-1">14</div>
          <p className="text-xs text-emerald-500 font-medium">+2 vs ontem</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">Receita do dia</h3>
          <div className="text-3xl font-bold mb-1">R$2.840</div>
          <p className="text-xs text-emerald-500 font-medium">82% da meta</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">Taxa de ocupação</h3>
          <div className="text-3xl font-bold mb-1">78%</div>
          <p className="text-xs text-emerald-500 font-medium">+5% semana</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium mb-2">Confirmados</h3>
          <div className="text-3xl font-bold mb-1">11/14</div>
          <p className="text-xs text-red-400 font-medium">3 pendentes</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Agenda de Hoje */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-6">Agenda de hoje</h2>
          
          <div className="flex gap-2 border-b border-border pb-4 mb-4 overflow-x-auto">
            <button className="px-4 py-1.5 rounded-full bg-secondary text-sm font-medium whitespace-nowrap">Todos</button>
            <button className="px-4 py-1.5 rounded-full text-muted-foreground hover:bg-secondary text-sm font-medium whitespace-nowrap transition-colors">Dra. Ana</button>
            <button className="px-4 py-1.5 rounded-full text-muted-foreground hover:bg-secondary text-sm font-medium whitespace-nowrap transition-colors">Dr. Carlos</button>
          </div>

          <div className="space-y-1">
            {agenda.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm font-medium w-12">{item.time}</span>
                  <div className={`size-2 rounded-full ${item.color}`} />
                  <span className="font-medium text-sm">{item.patient}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.procedure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ocupação por profissional */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-8">Ocupação por profissional</h2>
          
          <div className="space-y-6 flex-1">
            {occupation.map((prof) => (
              <div key={prof.name} className="flex items-center gap-4">
                <span className="text-sm font-medium w-24 text-muted-foreground">{prof.name}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${prof.color} rounded-full`} style={{ width: prof.width }} />
                </div>
                <span className="text-sm font-medium w-10 text-right text-muted-foreground">{prof.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Próximos horários vagos</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">Dr. Carlos 13h</span>
              <span className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">Dra. Lúcia 15h</span>
              <span className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">Dr. Marcos 16h</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
