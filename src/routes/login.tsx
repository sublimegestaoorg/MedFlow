import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
      setLoading(false);
      return;
    }

    toast.success("Login efetuado com sucesso!");
    navigate({ to: "/app" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-surface flex relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-24 relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="size-12 bg-brand rounded-xl grid place-items-center shadow-lg">
            <HeartPulse className="size-6 text-brand-foreground" />
          </div>
          <span className="font-display font-bold text-3xl tracking-tight text-brand-dark">
            MedFlow
          </span>
        </div>
        
        <h1 className="text-5xl font-bold font-display leading-[1.1] mb-6 text-brand-dark">
          Gestão inteligente,<br />
          <span className="text-brand">resultados visíveis.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
          Acesse sua clínica de onde estiver. Acompanhe agendas, faturamento e pacientes em um só lugar.
        </p>
        
        <div className="mt-16 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`size-10 rounded-full border-2 border-brand-surface bg-brand/20 grid place-items-center z-${10-i}`}>
                 <span className="text-xs font-bold text-brand">P{i}</span>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Mais de <span className="text-brand-dark font-bold">1.200 clínicas</span> ativas
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="size-8 bg-brand rounded-lg grid place-items-center">
              <HeartPulse className="size-4 text-brand-foreground" />
            </div>
            <span className="font-display font-bold text-xl">MedFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display mb-2">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm">Insira suas credenciais para acessar a plataforma.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-brand-dark ml-1">E-mail corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@suaclinica.com.br"
                className="w-full bg-white px-4 py-3.5 rounded-xl border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-brand-dark">Senha</label>
                <a href="#" className="text-xs font-semibold text-brand hover:text-brand-accent transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white px-4 py-3.5 rounded-xl border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand text-brand-foreground font-bold py-4 rounded-xl shadow-[var(--shadow-brand)] hover:-translate-y-0.5 hover:shadow-lg transition-all active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "Entrar na plataforma"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <a href="/" className="font-bold text-brand hover:text-brand-accent transition-colors">
              Fale com um consultor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
