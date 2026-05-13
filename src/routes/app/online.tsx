import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Circle, ShieldAlert, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useClinicPresence } from "@/hooks/use-presence";

export const Route = createFileRoute("/app/online")({
  component: OnlineUsersPage,
});

type Profile = {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  clinic_id: string | null;
  specialty: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function OnlineUsersPage() {
  const [me, setMe] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url, clinic_id, specialty")
        .eq("id", auth.user.id)
        .single();
      setMe(profile as Profile | null);

      if (profile?.clinic_id) {
        const { data: members } = await supabase
          .from("profiles")
          .select("id, full_name, role, avatar_url, clinic_id, specialty")
          .eq("clinic_id", profile.clinic_id);
        setTeam((members ?? []) as Profile[]);
      }
      setLoading(false);
    })();
  }, []);

  const online = useClinicPresence({
    clinicId: me?.clinic_id ?? null,
    me: me
      ? {
          user_id: me.id,
          full_name: me.full_name,
          role: me.role,
          avatar_url: me.avatar_url,
        }
      : null,
    currentPage: "/app/online",
  });

  if (loading) {
    return <div className="text-muted-foreground">Carregando…</div>;
  }

  if (!me) {
    return <div className="text-muted-foreground">Faça login para acessar esta área.</div>;
  }

  if (me.role !== "admin" && me.role !== "owner") {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <ShieldAlert className="size-10 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">Acesso restrito</h2>
        <p className="text-muted-foreground mt-2">
          Apenas administradores podem ver quem está online.
        </p>
      </div>
    );
  }

  const onlineIds = new Set(online.map((u) => u.user_id));
  const onlineMembers = team.filter((m) => onlineIds.has(m.id));
  const offlineMembers = team.filter((m) => !onlineIds.has(m.id));

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Usuários online</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe em tempo real quem da sua clínica está usando a plataforma agora.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat icon={Circle} label="Online agora" value={onlineMembers.length} accent="text-emerald-500" />
        <Stat icon={Users} label="Total da equipe" value={team.length} accent="text-brand" />
        <Stat
          icon={Activity}
          label="Taxa de atividade"
          value={team.length ? `${Math.round((onlineMembers.length / team.length) * 100)}%` : "0%"}
          accent="text-amber-500"
        />
      </div>

      <Section title={`Online (${onlineMembers.length})`}>
        {onlineMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">Ninguém está online no momento.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {onlineMembers.map((u) => {
            const presence = online.find((o) => o.user_id === u.id);
            return (
              <UserRow
                key={u.id}
                name={u.full_name}
                role={u.role}
                specialty={u.specialty}
                online
                page={presence?.current_page}
                since={presence?.online_at}
              />
            );
          })}
        </div>
      </Section>

      <Section title={`Offline (${offlineMembers.length})`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {offlineMembers.map((u) => (
            <UserRow
              key={u.id}
              name={u.full_name}
              role={u.role}
              specialty={u.specialty}
              online={false}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className={`size-4 ${accent}`} />
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-lg">{title}</h2>
      {children}
    </section>
  );
}

function UserRow({
  name,
  role,
  specialty,
  online,
  page,
  since,
}: {
  name: string;
  role: string;
  specialty?: string | null;
  online: boolean;
  page?: string;
  since?: string;
}) {
  const sinceLabel = since ? formatSince(since) : null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="relative">
        <div className="size-10 rounded-full bg-brand/20 grid place-items-center font-bold text-brand">
          {initials(name)}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${
            online ? "bg-emerald-500" : "bg-muted-foreground/40"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{name}</p>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
            {role}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {specialty ?? "—"}
          {online && page ? ` · em ${page}` : ""}
          {online && sinceLabel ? ` · há ${sinceLabel}` : ""}
        </p>
      </div>
    </div>
  );
}

function formatSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h}h`;
}
