import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Rocket, Wallet, BarChart3, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap MedFlow — 12 meses" },
      { name: "description", content: "Plano de evolução em 4 fases ao longo de 12 meses: fundação, financeiro, CRM/BI e IA + escala." },
      { property: "og:title", content: "Roadmap MedFlow — 12 meses" },
      { property: "og:description", content: "4 fases · 12 meses · 7 módulos · primeiro lançamento no M6." },
    ],
  }),
  component: RoadmapPage,
});

type Sprint = { name: string; items: string[] };
type Phase = {
  id: string;
  range: string;
  title: string;
  subtitle: string;
  icon: typeof Rocket;
  tone: string;
  border: string;
  marker: string;
  sprints: Sprint[];
  rationale: string;
};

const phases: Phase[] = [
  {
    id: "f1",
    range: "Meses 1–3",
    title: "Fundação & MVP",
    subtitle: "Fase 1",
    icon: Rocket,
    tone: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    marker: "Marco M3: versão interna testada com 2 clínicas-piloto — agendamento + prontuário funcionando.",
    sprints: [
      { name: "Sprint 1–2 · Infraestrutura", items: ["Setup cloud (AWS/GCP)", "Autenticação multi-tenant", "CI/CD pipeline", "Banco PostgreSQL + Redis"] },
      { name: "Sprint 3–4 · Agendamento", items: ["Agenda por profissional", "Bloqueio de horários", "Confirmação por email", "Painel da recepção"] },
      { name: "Sprint 5–6 · Cadastros base", items: ["Cadastro de pacientes", "Prontuário simples", "Templates por especialidade", "Upload de arquivos"] },
    ],
    rationale: "Nada visível ao cliente, mas tudo que determina o futuro. Multi-tenancy e estrutura de dados certa custam caro de refazer depois.",
  },
  {
    id: "f2",
    range: "Meses 4–6",
    title: "Financeiro & Comunicação",
    subtitle: "Fase 2",
    icon: Wallet,
    tone: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    marker: "Marco M6: lançamento beta público — produto vendável para clínicas de até 5 profissionais.",
    sprints: [
      { name: "Sprint 7–8 · Financeiro", items: ["Fluxo de caixa", "Integração PIX/cartão", "Comissões de equipe", "Emissão de NFS-e"] },
      { name: "Sprint 9–10 · WhatsApp", items: ["WhatsApp Business API", "Lembretes automáticos", "Confirmação de consultas", "Chatbot básico"] },
      { name: "Sprint 11–12 · Equipe", items: ["Perfis e permissões", "Agenda por profissional", "Relatório de produção", "Login individual"] },
    ],
    rationale: "Agendamento + financeiro + WhatsApp + equipe é o conjunto mínimo que substitui planilha + WhatsApp + caderno usados hoje.",
  },
  {
    id: "f3",
    range: "Meses 7–9",
    title: "CRM, BI & Especialidades",
    subtitle: "Fase 3",
    icon: BarChart3,
    tone: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
    marker: "Marco M9: versão completa para médicas, estéticas e odontológicas — meta 50 clientes pagantes.",
    sprints: [
      { name: "Sprint 13–14 · CRM", items: ["Ficha 360° do paciente", "Segmentação de base", "NPS automático", "Campanha de reativação"] },
      { name: "Sprint 15–16 · BI", items: ["Dashboard executivo", "KPIs em tempo real", "Relatório de ocupação", "Ticket médio e LTV"] },
      { name: "Sprint 17–18 · Especialidades", items: ["Odontograma interativo", "Pacotes de estética", "Controle de estoque", "Faturamento TISS"] },
    ],
    rationale: "CRM, BI e suporte às especialidades separam um sistema básico de uma plataforma séria. Aqui você compete de igual com GestãoDS e iClinic.",
  },
  {
    id: "f4",
    range: "Meses 10–12",
    title: "IA, App & Escala",
    subtitle: "Fase 4",
    icon: Sparkles,
    tone: "bg-violet-50 text-violet-700",
    border: "border-violet-200",
    marker: "Marco M12: plataforma completa com IA, app mobile e suporte a redes — meta 200+ clientes.",
    sprints: [
      { name: "Sprint 19–20 · IA", items: ["Prontuário por voz", "Score de churn", "Insights automáticos", "Chatbot avançado"] },
      { name: "Sprint 21–22 · App mobile", items: ["App iOS + Android", "Portal do paciente", "Check-in digital", "Notificações push"] },
      { name: "Sprint 23–24 · Escala", items: ["Multi-unidade / rede", "Open Finance", "API pública", "Marketplace de apps"] },
    ],
    rationale: "Voz, churn, app do paciente e multi-unidade constroem o moat — o custo de trocar a plataforma fica alto para o cliente.",
  },
];

const stack = [
  "Next.js (web)", "React Native (app)", "Node.js / FastAPI", "PostgreSQL",
  "Redis", "WhatsApp API", "Pagar.me / Stripe", "AWS / GCP", "OpenAI / Whisper", "SEFAZ NFS-e",
];

function RoadmapPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-brand rounded-lg grid place-items-center">
            <HeartPulse className="size-4 text-brand-foreground" />
          </div>
          <span className="font-display font-bold text-xl">MedFlow</span>
        </Link>
        <Link to="/login" className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand transition-colors">
          Acessar plataforma
        </Link>
      </nav>

      <header className="max-w-5xl mx-auto px-6 md:px-8 pt-8 pb-12">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Roadmap estratégico</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Roadmap MedFlow — 12 meses</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Sequência desenhada para ter algo vendável o mais rápido possível, enquanto se constrói a base certa para escalar.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { v: "4", l: "Fases" },
            { v: "12", l: "Meses" },
            { v: "7", l: "Módulos" },
            { v: "M6", l: "Primeiro lançamento" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
              <div className="font-display text-3xl font-bold text-brand-dark">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16 space-y-8">
        {phases.map((phase) => {
          const Icon = phase.icon;
          return (
            <article key={phase.id} className={`rounded-3xl border ${phase.border} bg-card overflow-hidden`}>
              <div className="flex items-start gap-4 p-6 md:p-8">
                <div className={`size-12 rounded-2xl grid place-items-center shrink-0 ${phase.tone}`}>
                  <Icon className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{phase.subtitle} · {phase.range}</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">{phase.title}</h2>
                  <p className="text-muted-foreground mt-2">{phase.rationale}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-px bg-border">
                {phase.sprints.map((sp) => (
                  <div key={sp.name} className="bg-card p-6">
                    <h3 className="font-semibold text-sm">{sp.name}</h3>
                    <ul className="mt-3 space-y-2">
                      {sp.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="size-4 mt-0.5 text-brand shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={`px-6 md:px-8 py-4 ${phase.tone} text-sm font-medium`}>
                {phase.marker}
              </div>
            </article>
          );
        })}
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="font-display text-2xl font-bold mb-4">Stack tecnológica recomendada</h2>
        <div className="flex flex-wrap gap-2">
          {stack.map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-full border border-border bg-card text-sm">{s}</span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-24">
        <h2 className="font-display text-2xl font-bold mb-4">Composição de time por fase</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Fase</th>
                <th className="px-4 py-3 font-semibold">Time mínimo</th>
                <th className="px-4 py-3 font-semibold">Perfis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border"><td className="px-4 py-3">1–2</td><td className="px-4 py-3">4–5 pessoas</td><td className="px-4 py-3 text-muted-foreground">2 devs fullstack, 1 dev mobile, 1 designer, 1 PO</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3">3</td><td className="px-4 py-3">+2</td><td className="px-4 py-3 text-muted-foreground">+1 dev backend (IA/dados), +1 dev frontend</td></tr>
              <tr className="border-t border-border"><td className="px-4 py-3">4</td><td className="px-4 py-3">+2</td><td className="px-4 py-3 text-muted-foreground">+1 eng. de dados, +1 especialista mobile</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
