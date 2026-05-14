import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Wallet, Users, HeartPulse, Check, Stethoscope, Smile, Sparkles } from "lucide-react";
import clinoraLogo from "@/assets/clinora-logo.png";
import clinoraCapa from "@/assets/clinora-capa.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinora — Gestão que cuida de clínicas e consultórios" },
      { name: "description", content: "Plataforma completa para dentistas, clínicas médicas, estéticas e consultórios de todas as especialidades. Agendamentos, prontuários, financeiro e gestão de equipe em um só lugar." },
      { property: "og:title", content: "Clinora — Gestão que cuida" },
      { property: "og:description", content: "Plataforma completa para dentistas, clínicas médicas, estéticas e consultórios de todas as especialidades." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Calendar, title: "Agenda Inteligente", desc: "Confirmação via WhatsApp automática e gestão de filas de espera otimizada.", tone: "bg-brand/10 text-brand" },
  { icon: Wallet, title: "Fluxo de Caixa", desc: "Controle de entradas, saídas, repasses e emissão de NFe em segundos.", tone: "bg-blue-50 text-blue-600" },
  { icon: Users, title: "Gestão de Equipe", desc: "Permissões, escalas de trabalho e produtividade por profissional.", tone: "bg-violet-50 text-violet-600" },
  { icon: HeartPulse, title: "CRM Pacientes", desc: "Histórico clínico completo, anexos digitais e régua de relacionamento.", tone: "bg-amber-50 text-amber-600" },
];

const specialties = [
  { icon: Smile, title: "Consultórios Odontológicos", desc: "Odontogramas digitais e planos de tratamento integrados." },
  { icon: Stethoscope, title: "Clínicas Médicas", desc: "Telemedicina, prescrição digital e faturamento TISS/TUSS." },
  { icon: Sparkles, title: "Clínicas de Estética", desc: "Pacotes, controle de estoque e fichas de anamnese personalizadas." },
];

const plans = [
  { name: "Essencial", price: "149", items: ["Até 2 profissionais", "Agenda ilimitada", "Prontuário eletrônico"], cta: "Selecionar", featured: false },
  { name: "Profissional", price: "289", items: ["Até 5 profissionais", "Gestão financeira completa", "WhatsApp ilimitado", "Emissão de notas fiscais"], cta: "Assinar agora", featured: true },
  { name: "Clínica", price: "499", items: ["Profissionais ilimitados", "Multiunidade", "API de integração"], cta: "Selecionar", featured: false },
];

function Landing() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src={clinoraLogo} alt="Clinora" className="size-9 rounded-lg object-contain" />
          <div className="leading-tight">
            <span className="font-display font-bold text-xl block">Clinora</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">gestão que cuida</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#especialidades" className="hover:text-foreground transition-colors">Especialidades</a>
          <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
        </div>
        <button className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand transition-colors">
          Começar agora
        </button>
      </nav>

      {/* Hero */}
      <header className="relative pt-12 pb-24 px-6 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Gestão inteligente para saúde
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] mb-6">
              Sua clínica no <span className="text-brand">piloto automático.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Agendamentos, prontuários, financeiro e gestão de equipe em uma única plataforma intuitiva, desenhada para profissionais de saúde modernos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-brand text-brand-foreground px-7 py-4 rounded-xl font-bold shadow-[var(--shadow-brand)] hover:-translate-y-0.5 transition-transform">
                Agendar demo grátis
              </button>
              <button className="px-7 py-4 rounded-xl font-bold border border-border hover:bg-secondary transition-colors">
                Ver funcionalidades
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src={clinoraCapa}
              alt="Clinora — plataforma de gestão para clínicas e consultórios"
              className="w-full aspect-[3/2] object-cover rounded-2xl border border-border shadow-2xl"
              loading="eager"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-xl border border-border hidden md:flex items-center gap-4">
              <div className="size-12 rounded-full bg-emerald-100 grid place-items-center text-emerald-600 font-bold">+24%</div>
              <div>
                <div className="text-sm font-bold">Crescimento mensal</div>
                <div className="text-xs text-muted-foreground">Faturamento otimizado</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="funcionalidades" className="py-24 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tudo que sua clínica precisa</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas integradas para eliminar a burocracia e focar no que importa: seus pacientes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, tone }) => (
              <div key={title} className="bg-card p-8 rounded-3xl border border-border hover:border-brand/30 transition-colors">
                <div className={`size-12 rounded-2xl mb-6 grid place-items-center ${tone}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="especialidades" className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Feito para a sua especialidade</h2>
            <p className="text-muted-foreground">Interfaces adaptadas aos diferentes fluxos clínicos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {specialties.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 rounded-3xl border border-border bg-card">
                <div className="size-12 rounded-2xl bg-brand/10 text-brand grid place-items-center mb-6">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planos para cada fase</h2>
            <p className="text-muted-foreground">Transparência total, sem taxas escondidas ou fidelidade abusiva.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? "p-10 rounded-3xl bg-brand-dark text-white shadow-2xl lg:scale-105"
                    : "p-8 rounded-3xl border border-border bg-card"
                }
              >
                {plan.featured && (
                  <div className="bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full inline-block mb-4">
                    Mais popular
                  </div>
                )}
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold font-display mb-6">
                  R$ {plan.price}
                  <span className={`text-base font-normal ${plan.featured ? "text-white/60" : "text-muted-foreground"}`}>/mês</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className={`flex items-center gap-2 ${plan.featured ? "text-white/85" : ""}`}>
                      <Check className="size-4 text-brand-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  className={
                    plan.featured
                      ? "w-full py-3.5 rounded-xl bg-brand text-brand-foreground font-bold hover:bg-brand-accent transition-colors"
                      : "w-full py-3 rounded-xl border border-border font-bold hover:bg-secondary transition-colors"
                  }
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-8 mb-24">
        <div className="max-w-7xl mx-auto bg-brand rounded-[2.5rem] px-6 md:px-10 py-20 text-center text-brand-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 size-96 bg-brand-accent/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Transforme a sua gestão hoje.</h2>
            <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto">
              Junte-se a clínicas que economizam mais de 15h por semana em burocracia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-brand px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all">
                Criar conta gratuita
              </button>
              <button className="bg-brand-dark/30 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-2xl font-bold">
                Falar com consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={clinoraLogo} alt="Clinora" className="size-7 rounded-md object-contain" />
            <span className="font-display font-bold">Clinora</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 Clinora — gestão que cuida.</p>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <a href="#" className="hover:text-brand transition-colors">Privacidade</a>
            <a href="#" className="hover:text-brand transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
