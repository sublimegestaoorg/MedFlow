import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Building2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/juridico")({
  head: () => ({
    meta: [
      { title: "Estrutura jurídica e societária — MedFlow" },
      { name: "description", content: "Constituição, compliance regulatório (LGPD, CFM 2.314/2022), cap table sugerido e checklist legal." },
    ],
  }),
  component: JuridicoPage,
});

const constitution = [
  ["SAS (Sociedade Anônima Simplificada)", "Formato ideal para startups que pretendem receber investimento. Permite ações, stock options e novos sócios sem burocracia excessiva."],
  ["CNAE principal: 6201-5/01", "Desenvolvimento de programas de computador sob encomenda. Habilita ISS reduzido (2%) e benefícios da Lei do Bem."],
  ["Regime tributário: Lucro Presumido", "Até R$ 4M de receita anual — carga efetiva ~15%. Migrar para Lucro Real ao superar."],
];

const compliance = [
  ["LGPD", "DPO nomeado, política de privacidade, contratos de tratamento de dados (controlador × operador), canal de direitos dos titulares."],
  ["CFM / Resolução 2.314/2022", "Prontuário eletrônico com assinatura digital ICP-Brasil, backup em nuvem e log de acesso com retenção mínima de 20 anos."],
  ["SBIS / CFM", "Certificação de software médico — não obrigatória, mas diferencial competitivo e requisito de redes hospitalares."],
  ["PCI-DSS", "Necessário se processar cartões diretamente. Mitigado usando gateway certificado (Pagar.me / Stripe)."],
];

const captable = [
  { role: "Fundador(a) CEO", tag: "Negócios / produto", color: "violet", pct: 45, vesting: "4 anos, cliff 1 ano" },
  { role: "Co-fundador CTO", tag: "Tecnologia", color: "emerald", pct: 35, vesting: "4 anos, cliff 1 ano" },
  { role: "Pool de stock options", tag: "Equipe futura", color: "blue", pct: 15, vesting: "Reservado para time" },
  { role: "Advisor(es)", tag: "Conselho / rede", color: "slate", pct: 5, vesting: "2 anos, cliff 6 meses" },
];

const checklist = [
  ["Registro da SAS", "Contrato social + CNPJ + alvará"],
  ["Acordo de sócios (SHA)", "Vesting, drag/tag-along, deadlock"],
  ["Registro de marca — INPI", "Classes 42 (software) e 44 (saúde)"],
  ["Política de privacidade + Termos", "Adequação LGPD para clínicas"],
  ["Contrato SaaS com clientes", "SLA, responsabilidade, dados"],
  ["DPA com sub-processadores", "AWS, OpenAI, Pagar.me, Twilio"],
  ["Pool de stock options", "Plano aprovado em AGE"],
  ["Certificação CFM (prontuário)", "Assinatura ICP-Brasil + log 20 anos"],
];

function JuridicoPage() {
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
          <Link to="/go-to-market" className="px-3 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground">Go-to-market</Link>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-6 md:px-8 pt-8 pb-12">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Estrutura legal</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Estrutura jurídica e societária</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Constituição recomendada, compliance regulatório obrigatório, cap table sugerido e checklist legal do dia 1 ao lançamento.
        </p>
      </header>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-12 grid md:grid-cols-2 gap-5">
        <Card icon={Building2} tone="bg-emerald-500/10 text-emerald-400 border-emerald-500/30" title="Constituição recomendada">
          <ul className="space-y-3">
            {constitution.map(([k, v]) => (
              <li key={k} className="text-sm">
                <span className="size-1.5 rounded-full bg-emerald-400 inline-block mr-2 align-middle" />
                <strong className="text-foreground">{k}</strong> — <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card icon={ShieldCheck} tone="bg-blue-500/10 text-blue-400 border-blue-500/30" title="Compliance regulatório obrigatório">
          <ul className="space-y-3">
            {compliance.map(([k, v]) => (
              <li key={k} className="text-sm">
                <span className="size-1.5 rounded-full bg-blue-400 inline-block mr-2 align-middle" />
                <strong className="text-foreground">{k}</strong> — <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-12">
        <h2 className="font-display text-2xl font-bold mb-6">Cap table sugerido — pré-investimento</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="col-span-4">Sócio</span>
            <span className="col-span-3">Papel</span>
            <span className="col-span-1 text-right">%</span>
            <span className="col-span-2">Distribuição</span>
            <span className="col-span-2">Vesting</span>
          </div>
          {captable.map((c) => (
            <div key={c.role} className="grid grid-cols-12 px-5 py-4 border-t border-border items-center text-sm">
              <span className="col-span-4 font-semibold">{c.role}</span>
              <span className="col-span-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${c.color}-500/15 text-${c.color}-400 border border-${c.color}-500/30`}>{c.tag}</span></span>
              <span className="col-span-1 text-right font-bold">{c.pct}%</span>
              <span className="col-span-2"><div className="h-2 bg-background rounded-full overflow-hidden"><div className={`h-full bg-${c.color}-500`} style={{ width: `${c.pct}%` }} /></div></span>
              <span className="col-span-2 text-muted-foreground text-xs">{c.vesting}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex gap-3">
          <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/90">
            <strong>Importante:</strong> esta é uma sugestão genérica — não substitui orientação jurídica especializada. Contratar um advogado societário com experiência em startups de tecnologia antes de formalizar qualquer acordo é indispensável.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-24">
        <h2 className="font-display text-2xl font-bold mb-6">Checklist legal — do dia 1 ao lançamento</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {checklist.map(([k, v]) => (
            <div key={k} className="flex items-start gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">{k}</div>
                <div className="text-xs text-muted-foreground">{v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, tone, title, children }: { icon: typeof Building2; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`size-10 rounded-xl border grid place-items-center ${tone}`}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      {children}
    </div>
  );
}
