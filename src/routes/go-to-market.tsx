import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Megaphone, Globe, Handshake, Target } from "lucide-react";

export const Route = createFileRoute("/go-to-market")({
  head: () => ({
    meta: [
      { title: "Estratégia de Go-to-Market — MedFlow" },
      { name: "description", content: "Canais de aquisição, funil de vendas e métricas-alvo (CAC, LTV, churn)." },
    ],
  }),
  component: GoToMarketPage,
});

const channels = [
  {
    icon: Handshake, tone: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    title: "Indicação + comunidade",
    items: [
      ["Programa de indicação", "Clínica que indica ganha 1 mês grátis — CAC quase zero, confiança máxima."],
      ["Grupos de gestores de saúde", "WhatsApp e Facebook — presença ativa, conteúdo educativo, não comercial."],
      ["Parcerias com faculdades", "Estudantes viram usuários, depois profissionais pagantes."],
    ],
  },
  {
    icon: Globe, tone: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    title: "Inbound digital",
    items: [
      ["SEO para dores específicas", '"software para clínica de estética", "sistema para dentista", "como reduzir faltas".'],
      ["YouTube + Instagram", "Conteúdo de gestão para clínicas — autoridade e leads orgânicos."],
      ["Google Ads de alta intenção", '"sistema gestão clínica", "software prontuário eletrônico".'],
    ],
  },
  {
    icon: Target, tone: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    title: "Parcerias B2B",
    items: [
      ["Distribuidores de insumos", "Proderma, Dental Cremer indicam o sistema para sua base."],
      ["Contadores especializados em saúde", "Recomendam como solução financeira para clientes."],
      ["Franquias de estética", "Espaço Laser, Studio W — um contrato = dezenas de unidades."],
    ],
  },
  {
    icon: Megaphone, tone: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    title: "Outbound ativo",
    items: [
      ["SDR no LinkedIn e Doctoralia", "Contato direto com donos de clínicas que usam concorrentes."],
      ["Eventos do setor", "AnBo, Abrademi, CBD (odontologia), congressos médicos regionais."],
      ["Cold email personalizado", "Clínicas mapeadas pelo Google Maps com baixa presença digital."],
    ],
  },
];

const funnel = [
  { label: "Visitantes/mês", value: 10000, pct: 100, color: "bg-emerald-500/20" },
  { label: "Leads (trial)", value: 500, pct: 5, color: "bg-blue-500/20" },
  { label: "Demo / ativação", value: 200, pct: 2, color: "bg-violet-500/20" },
  { label: "Pagantes", value: 50, pct: 0.5, color: "bg-amber-500/20" },
  { label: "Retidos 6m+", value: 40, pct: 0.4, color: "bg-emerald-500/30" },
];

const metrics = [
  { label: "CAC médio", value: "R$ 250" },
  { label: "LTV (24 meses)", value: "R$ 9.500" },
  { label: "LTV / CAC", value: "38x" },
  { label: "Churn mensal meta", value: "< 3%" },
];

function GoToMarketPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-brand rounded-lg grid place-items-center">
            <HeartPulse className="size-4 text-brand-foreground" />
          </div>
          <span className="font-display font-bold text-xl">MedFlow</span>
        </Link>
        <div className="flex gap-2 text-sm">
          <Link to="/roadmap" className="px-3 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground">Roadmap</Link>
          <Link to="/juridico" className="px-3 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground">Jurídico</Link>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-6 md:px-8 pt-8 pb-12">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Estratégia comercial</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Estratégia de Go-to-Market</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Quatro canais de aquisição combinados, funil de conversão esperado e métricas-alvo que tornam o negócio atraente para investidores.
        </p>
      </header>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-12">
        <h2 className="font-display text-2xl font-bold mb-6">Canais de aquisição</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {channels.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`size-10 rounded-xl border grid place-items-center ${c.tone}`}>
                  <c.icon className="size-5" />
                </div>
                <h3 className="font-bold text-lg">{c.title}</h3>
              </div>
              <ol className="space-y-3">
                {c.items.map((it, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="size-5 rounded-full bg-secondary text-foreground/70 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span><strong className="text-foreground">{it[0]}</strong> — <span className="text-muted-foreground">{it[1]}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-12">
        <h2 className="font-display text-2xl font-bold mb-6">Funil de vendas — conversão esperada</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          {funnel.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-36 shrink-0">{f.label}</span>
              <div className="flex-1 h-9 bg-background rounded-lg overflow-hidden border border-border">
                <div className={`h-full ${f.color} flex items-center px-3 font-semibold text-sm`} style={{ width: `${Math.max(f.pct, 3)}%` }}>
                  {f.value.toLocaleString("pt-BR")}
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">{f.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-24">
        <h2 className="font-display text-2xl font-bold mb-6">Métricas-alvo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="font-display text-3xl font-bold text-brand-dark">{m.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-6 max-w-3xl">
          A relação <strong className="text-foreground">LTV/CAC de 38x</strong> é o que torna o negócio atraente para investidores — clínicas têm altíssima retenção quando o sistema vira parte da operação.
        </p>
      </section>
    </div>
  );
}
