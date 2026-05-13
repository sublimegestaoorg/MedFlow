import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Bell, MessageCircle, AlertTriangle, CreditCard, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { NovoAgendamentoModal } from "@/components/NovoAgendamentoModal";

export const Route = createFileRoute("/app/")({
  component: DashboardOverview,
});

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Agendado", cls: "bg-secondary text-muted-foreground border border-border" },
  confirmed: { label: "Confirmado", cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" },
  in_progress: { label: "Em atendimento", cls: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  completed: { label: "Concluído", cls: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
  cancelled: { label: "Cancelado", cls: "bg-rose-500/15 text-rose-300 border border-rose-500/30" },
  no_show: { label: "Faltou", cls: "bg-rose-500/15 text-rose-300 border border-rose-500/30" },
};

type Apt = {
  id: string;
  appointment_date: string;
  status: string;
  type: string | null;
  patients: { id: string; full_name: string } | null;
};

type Tx = { id: string; amount: number; date: string; type: string };

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

function DashboardOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agenda, setAgenda] = useState<Apt[]>([]);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [revenue7d, setRevenue7d] = useState<{ day: string; total: number }[]>([]);
  const [userName, setUserName] = useState<string>("");

  const today = startOfDay(new Date());

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const sevenAgo = new Date(today); sevenAgo.setDate(today.getDate() - 6);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (prof?.full_name) setUserName(prof.full_name.split(" ")[0]);
    }

    const [todayRes, ydayRes, waitRes, txRes] = await Promise.all([
      supabase.from("appointments")
        .select("id, appointment_date, status, type, patients(id, full_name)")
        .gte("appointment_date", today.toISOString())
        .lt("appointment_date", tomorrow.toISOString())
        .order("appointment_date", { ascending: true }),
      supabase.from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("appointment_date", yesterday.toISOString())
        .lt("appointment_date", today.toISOString()),
      supabase.from("waitlist").select("id", { count: "exact", head: true }).eq("status", "waiting"),
      supabase.from("transactions")
        .select("id, amount, date, type")
        .eq("type", "income")
        .gte("date", sevenAgo.toISOString().slice(0, 10))
        .lte("date", today.toISOString().slice(0, 10)),
    ]);

    setAgenda((todayRes.data as any) || []);
    setYesterdayCount(ydayRes.count || 0);
    setWaitlistCount(waitRes.count || 0);

    // Build 7-day revenue
    const buckets: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenAgo); d.setDate(sevenAgo.getDate() + i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    (txRes.data || []).forEach((t: Tx) => {
      const k = t.date;
      if (k in buckets) buckets[k] += Number(t.amount);
    });
    setRevenue7d(Object.entries(buckets).map(([day, total]) => ({ day, total })));
  };

  const todayCount = agenda.length;
  const todayRevenue = agenda
    .filter((a) => a.status === "completed" || a.status === "in_progress" || a.status === "confirmed")
    .length * 0; // placeholder until appointment.price wired
  const completedToday = agenda.filter((a) => a.status === "completed").length;
  const noShows = agenda.filter((a) => a.status === "no_show").length;
  const occupancy = todayCount > 0 ? Math.round(((todayCount - noShows) / Math.max(todayCount, 1)) * 100) : 0;

  const maxRev = Math.max(...revenue7d.map((r) => r.total), 1);
  const dayLabel = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  // mock notifications stream (no notifications table yet)
  const notifications = [
    { icon: MessageCircle, tone: "text-emerald-400", text: "Confirmações WhatsApp serão exibidas aqui assim que a integração for ativada.", time: "fase 2" },
    { icon: AlertTriangle, tone: "text-amber-400", text: `Fila de espera com ${waitlistCount} paciente${waitlistCount === 1 ? "" : "s"} aguardando encaixe.`, time: "agora" },
    { icon: CreditCard, tone: "text-blue-400", text: "Pagamentos PIX/cartão chegam aqui após integração com Pagar.me.", time: "fase 2" },
    { icon: Star, tone: "text-emerald-400", text: "NPS automático será disparado ao final de cada atendimento.", time: "fase 3" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <NovoAgendamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadAll} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}{userName ? `, ${userName}` : ""}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {today.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600/30 transition-colors"
          >
            <Plus className="size-4" />
            <span>Novo agendamento</span>
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors relative">
            <Bell className="size-5" />
            {waitlistCount > 0 && <span className="absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Consultas hoje"
          value={String(todayCount)}
          delta={`${todayCount - yesterdayCount >= 0 ? "+" : ""}${todayCount - yesterdayCount} vs ontem`}
          tone={todayCount - yesterdayCount >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Concluídas"
          value={`${completedToday}/${todayCount || 0}`}
          delta={todayCount === 0 ? "sem agenda" : `${Math.round((completedToday / todayCount) * 100)}% do dia`}
          tone="muted"
        />
        <KpiCard
          label="Faltas hoje"
          value={String(noShows)}
          delta={`fila de espera: ${waitlistCount}`}
          tone={noShows > 0 ? "negative" : "muted"}
        />
        <KpiCard
          label="Ocupação"
          value={`${occupancy}%`}
          delta="meta: 85%"
          tone={occupancy >= 85 ? "positive" : "muted"}
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agenda do dia */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Agenda de hoje</h2>
            <Link to="/app/agendamentos" className="text-sm text-blue-400 hover:text-blue-300 font-medium">ver completa →</Link>
          </div>

          {agenda.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">Sem agendamentos para hoje.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium">+ criar primeiro agendamento</button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {agenda.map((a) => {
                const time = new Date(a.appointment_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                const status = STATUS_LABEL[a.status] || STATUS_LABEL.scheduled;
                return (
                  <li key={a.id} className="py-3 flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground w-14 shrink-0">{time}</span>
                    <Link
                      to="/app/pacientes/$id"
                      params={{ id: a.patients?.id || "" }}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">
                        {a.patients?.full_name ?? "Paciente"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{a.type ?? "Consulta"}</div>
                    </Link>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium shrink-0 ${status.cls}`}>{status.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Notificações */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Notificações</h2>
            <span className="text-xs text-muted-foreground">tempo real</span>
          </div>
          <ul className="space-y-4">
            {notifications.map((n, i) => (
              <li key={i} className="flex items-start gap-3">
                <n.icon className={`size-4 mt-0.5 shrink-0 ${n.tone}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.text}</p>
                  <span className="text-[11px] text-muted-foreground">{n.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Receita 7 dias */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Receita — últimos 7 dias</h2>
          <span className="text-sm font-bold text-emerald-400">
            R$ {revenue7d.reduce((s, r) => s + r.total, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-end gap-2 h-40">
          {revenue7d.map((r, i) => {
            const h = (r.total / maxRev) * 100;
            const isToday = i === revenue7d.length - 1;
            const date = new Date(r.day + "T00:00:00");
            return (
              <div key={r.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? "bg-blue-500" : "bg-blue-500/30"}`}
                    style={{ height: `${Math.max(h, 4)}%` }}
                    title={`R$ ${r.total.toFixed(2)}`}
                  />
                </div>
                <span className={`text-xs ${isToday ? "font-bold text-blue-300" : "text-muted-foreground"}`}>
                  {isToday ? "Hoje" : dayLabel[date.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "positive" | "negative" | "muted" }) {
  const toneCls = tone === "positive" ? "text-emerald-400" : tone === "negative" ? "text-rose-400" : "text-muted-foreground";
  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
      <h3 className="text-muted-foreground text-sm font-medium mb-2">{label}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className={`text-xs font-medium ${toneCls}`}>{delta}</p>
    </div>
  );
}
