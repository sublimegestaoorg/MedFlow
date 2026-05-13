import { useEffect, useState } from "react";
import { X, Loader2, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type Procedimento = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  base_price: number;
  color: string;
  specialty: string | null;
  requires_room: boolean;
  active: boolean;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  procedimento?: Procedimento | null;
}

const COLORS = ["teal", "blue", "violet", "amber", "rose", "emerald"];

export function ProcedimentoModal({ isOpen, onClose, onSuccess, procedimento }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [color, setColor] = useState("teal");
  const [specialty, setSpecialty] = useState("");
  const [requiresRoom, setRequiresRoom] = useState(false);

  useEffect(() => {
    if (procedimento) {
      setName(procedimento.name);
      setDescription(procedimento.description ?? "");
      setDuration(procedimento.duration_minutes);
      setPrice(Number(procedimento.base_price));
      setColor(procedimento.color);
      setSpecialty(procedimento.specialty ?? "");
      setRequiresRoom(procedimento.requires_room);
    } else {
      setName("");
      setDescription("");
      setDuration(30);
      setPrice(0);
      setColor("teal");
      setSpecialty("");
      setRequiresRoom(false);
    }
  }, [procedimento, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do procedimento é obrigatório.");
      return;
    }

    setLoading(true);

    // Resolve clinic_id from current user's profile
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Sessão expirada.");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", auth.user.id)
      .single();

    if (!profile?.clinic_id) {
      toast.error("Sua conta não está vinculada a uma clínica.");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      duration_minutes: duration,
      base_price: price,
      color,
      specialty: specialty.trim() || null,
      requires_room: requiresRoom,
    };

    const { error } = procedimento
      ? await supabase.from("procedures").update(payload).eq("id", procedimento.id)
      : await supabase
          .from("procedures")
          .insert({ ...payload, active: true, clinic_id: profile.clinic_id });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(procedimento ? "Procedimento atualizado." : "Procedimento criado.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-brand/15 grid place-items-center">
              <Stethoscope className="size-4 text-brand" />
            </div>
            <div>
              <h2 className="font-semibold">
                {procedimento ? "Editar procedimento" : "Novo procedimento"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure duração, preço e especialidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Nome *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Limpeza de pele"
              className="input"
              autoFocus
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Detalhes opcionais"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duração (min)">
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Preço base (R$)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="input"
              />
            </Field>
          </div>

          <Field label="Especialidade">
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex: Estética facial"
              className="input"
            />
          </Field>

          <Field label="Cor (etiqueta na agenda)">
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`size-8 rounded-full border-2 transition ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ background: `var(--color-${c}-500, hsl(var(--brand)))` }}
                  title={c}
                >
                  <span className={`block size-full rounded-full bg-${c}-500`} />
                </button>
              ))}
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresRoom}
              onChange={(e) => setRequiresRoom(e.target.checked)}
              className="size-4 accent-brand"
            />
            Requer sala/equipamento
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {procedimento ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border-radius: 0.5rem;
          background: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
        }
        .input:focus { border-color: hsl(var(--brand)); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
