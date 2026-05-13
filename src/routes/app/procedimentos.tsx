import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Power, Stethoscope, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProcedimentoModal, type Procedimento } from "@/components/ProcedimentoModal";

export const Route = createFileRoute("/app/procedimentos")({
  component: ProcedimentosPage,
});

function ProcedimentosPage() {
  const [items, setItems] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Procedimento | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("procedures")
      .select("id, name, description, duration_minutes, base_price, color, specialty, requires_room, active")
      .order("name", { ascending: true });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((data ?? []) as Procedimento[]);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleActive = async (proc: Procedimento) => {
    const { error } = await supabase
      .from("procedures")
      .update({ active: !proc.active })
      .eq("id", proc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(proc.active ? "Procedimento desativado." : "Procedimento ativado.");
    fetchItems();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((p) => (showInactive ? true : p.active))
      .filter((p) =>
        q
          ? p.name.toLowerCase().includes(q) ||
            (p.specialty ?? "").toLowerCase().includes(q)
          : true
      );
  }, [items, query, showInactive]);

  const totals = useMemo(() => {
    const active = items.filter((i) => i.active).length;
    const avgPrice =
      items.length > 0
        ? items.reduce((s, i) => s + Number(i.base_price), 0) / items.length
        : 0;
    return { active, total: items.length, avgPrice };
  }, [items]);

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Procedimentos</h1>
          <p className="text-muted-foreground mt-1">
            Catálogo de serviços oferecidos pela clínica
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-brand-foreground font-semibold text-sm hover:opacity-90"
        >
          <Plus className="size-4" />
          Novo procedimento
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat icon={Stethoscope} label="Ativos" value={totals.active} />
        <Stat icon={Clock} label="Cadastrados" value={totals.total} />
        <Stat
          icon={DollarSign}
          label="Preço médio"
          value={totals.avgPrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou especialidade…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-brand"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="size-4 accent-brand"
          />
          Mostrar inativos
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Procedimento</th>
              <th className="px-4 py-3">Especialidade</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0
                    ? "Nenhum procedimento cadastrado ainda. Clique em Novo procedimento."
                    : "Nada encontrado com esses filtros."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ background: colorToHex(p.color) }}
                      />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.specialty ?? "—"}
                  </td>
                  <td className="px-4 py-3">{p.duration_minutes} min</td>
                  <td className="px-4 py-3">
                    {Number(p.base_price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        p.active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`p-2 rounded-lg hover:bg-secondary ${
                          p.active
                            ? "text-muted-foreground hover:text-destructive"
                            : "text-emerald-500"
                        }`}
                        title={p.active ? "Desativar" : "Ativar"}
                      >
                        <Power className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProcedimentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchItems}
        procedimento={editing}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="size-4 text-brand" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    teal: "#14b8a6",
    blue: "#3b82f6",
    violet: "#8b5cf6",
    amber: "#f59e0b",
    rose: "#f43f5e",
    emerald: "#10b981",
  };
  return map[color] ?? "#14b8a6";
}
