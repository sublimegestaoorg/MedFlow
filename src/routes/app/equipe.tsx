import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, UserPlus, Shield, Stethoscope, ConciergeBell, Users } from "lucide-react";

export const Route = createFileRoute("/app/equipe")({
  component: Equipe,
});

type Member = {
  id: string;
  full_name: string;
  role: "admin" | "professional" | "receptionist";
  specialty: string | null;
};

const roleConfig = {
  admin: { label: "Administrador", icon: Shield, color: "text-amber-600 bg-amber-500/10" },
  professional: { label: "Profissional", icon: Stethoscope, color: "text-brand bg-brand/10" },
  receptionist: { label: "Recepcionista", icon: ConciergeBell, color: "text-blue-600 bg-blue-500/10" },
};

function Equipe() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ id: string; clinic_id: string; role: string } | null>(null);

  // form
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Member["role"]>("professional");
  const [specialty, setSpecialty] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, clinic_id, role")
      .eq("id", auth.user.id)
      .single();

    if (profile) setMe(profile as any);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, specialty")
      .order("full_name");

    if (error) toast.error(error.message);
    else setMembers((data || []) as Member[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me?.clinic_id) return toast.error("Clínica não identificada.");
    if (me.role !== "admin") return toast.error("Apenas administradores podem adicionar membros.");

    setSubmitting(true);

    // Use a SECONDARY supabase client so we don't replace the admin's session
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: signUp, error: signUpErr } = await tempClient.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    if (signUpErr || !signUp.user) {
      setSubmitting(false);
      return toast.error(signUpErr?.message || "Falha ao criar usuário.");
    }

    // If session was returned (auto-confirm), use it. Otherwise sign in.
    if (!signUp.session) {
      const { error: siErr } = await tempClient.auth.signInWithPassword({ email, password });
      if (siErr) {
        setSubmitting(false);
        return toast.error("Usuário criado, mas requer confirmação de e-mail. Desative confirmação no provedor.");
      }
    }

    // Insert profile from new user's session (respects RLS: auth.uid() = id)
    const { error: pErr } = await tempClient.from("profiles").insert({
      id: signUp.user.id,
      full_name: fullName,
      role,
      specialty: specialty || null,
      clinic_id: me.clinic_id,
    });

    await tempClient.auth.signOut();

    if (pErr) {
      setSubmitting(false);
      return toast.error("Auth criado, mas perfil falhou: " + pErr.message);
    }

    toast.success(`${fullName} adicionado(a) à equipe.`);
    setOpen(false);
    setFullName(""); setEmail(""); setPassword(""); setSpecialty(""); setRole("professional");
    setSubmitting(false);
    load();
  };

  const isAdmin = me?.role === "admin";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Users className="size-6 text-brand" /> Equipe
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários com acesso à sua clínica.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-brand text-brand-foreground font-bold px-4 py-2.5 rounded-xl shadow-[var(--shadow-brand)] hover:-translate-y-0.5 transition-all"
          >
            <UserPlus className="size-4" /> Novo membro
          </button>
        )}
      </div>

      {!isAdmin && me && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm rounded-xl px-4 py-3">
          Apenas administradores podem adicionar ou remover membros da equipe.
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 grid place-items-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Nenhum membro encontrado.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Nome</th>
                <th className="text-left px-6 py-3 font-semibold">Função</th>
                <th className="text-left px-6 py-3 font-semibold">Especialidade</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const cfg = roleConfig[m.role];
                const Icon = cfg.icon;
                return (
                  <tr key={m.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-6 py-4 font-medium text-foreground">{m.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                        <Icon className="size-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{m.specialty || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold font-display">Adicionar membro</h2>
              <p className="text-sm text-muted-foreground mt-1">O usuário poderá entrar com o código <b>da sua clínica</b>.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nome completo</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background px-3 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background px-3 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Senha temporária</label>
              <input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-background px-3 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Função</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Member["role"])}
                  className="w-full bg-background px-3 py-2.5 rounded-lg border border-border outline-none">
                  <option value="professional">Profissional</option>
                  <option value="receptionist">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Especialidade</label>
                <input value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Opcional"
                  className="w-full bg-background px-3 py-2.5 rounded-lg border border-border outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary text-sm font-semibold">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 bg-brand text-brand-foreground font-bold px-4 py-2.5 rounded-lg disabled:opacity-70">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                Criar usuário
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
