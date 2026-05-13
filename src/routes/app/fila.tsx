import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Loader2, Trash2, CalendarPlus, Search, ListOrdered } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/fila")({
  component: FilaPage,
});

type WaitItem = {
  id: string;
  status: string;
  notes: string | null;
  preferred_period: string | null;
  created_at: string;
  patient_id: string;
  procedure_id: string | null;
  professional_id: string | null;
  patients: { full_name: string; phone: string | null } | null;
  procedures: { name: string } | null;
  profiles: { full_name: string } | null;
};

type Mini = { id: string; full_name: string };
type Proc = { id: string; name: string };

const PERIODS = [
  { value: "morning", label: "Manhã" },
  { value: "afternoon", label: "Tarde" },
  { value: "evening", label: "Noite" },
  { value: "any", label: "Qualquer" },
];

function FilaPage() {
  const [items, setItems] = useState<WaitItem[]>([]);
  const [patients, setPatients] = useState<Mini[]>([]);
  const [procs, setProcs] = useState<Proc[]>([]);
  const [pros, setPros] = useState<Mini[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // form
  const [patientId, setPatientId] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [period, setPeriod] = useState("any");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [w, p, pr, prof] = await Promise.all([
      supabase.from("waitlist")
        .select("id, status, notes, preferred_period, created_at, patient_id, procedure_id, professional_id, patients(full_name, phone), procedures(name), profiles(full_name)")
        .order("created_at", { ascending: true }),
      supabase.from("patients").select("id, full_name").order("full_name"),
      supabase.from("procedures").select("id, name").eq("active", true).order("name"),
      supabase.from("profiles").select("id, full_name").in("role", ["doctor", "professional", "admin", "owner"]),
    ]);
    setItems((w.data ?? []) as unknown as WaitItem[]);
    setPatients((p.data ?? []) as Mini[]);
    setProcs((pr.data ?? []) as Proc[]);
    setPros((prof.data ?? []) as Mini[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("waitlist-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { toast.error("Selecione um paciente."); return; }
    setSaving(true);
    const { error } = await supabase.from("waitlist").insert({
      patient_id: patientId,
      procedure_id: procedureId || null,
      professional_id: professionalId || null,
      preferred_period: period,
      notes: notes || null,
      status: "waiting",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Adicionado à fila.");
    setShowForm(false);
    setPatientId(""); setProcedureId(""); setProfessionalId(""); setPeriod("any"); setNotes("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removido da fila.");
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("waitlist").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
  };

  const filtered = items.filter((i) =>
    !search || i.patients?.full_name.toLowerCase().includes(search.toLowerCase())
  );
  const waiting = filtered.filter((i) => i.status === "waiting");
  const contacted = filtered.filter((i) => i.status === "contacted");
  const scheduled = filtered.filter((i) => i.status === "scheduled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Fila de espera</h1>
          <p className="text-sm text-muted-foreground">Pacientes aguardando uma vaga ou retorno.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand text-brand-foreground font-bold px-4 py-2.5 rounded-xl hover:bg-brand/90">
          <Plus className="size-4" /> Adicionar à fila
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="Aguardando" value={waiting.length} tone="amber" icon={<ListOrdered className="size-5" />} />
        <KPI label="Contatados" value={contacted.length} tone="blue" icon={<ListOrdered className="size-5" />} />
        <KPI label="Já agendados" value={scheduled.length} tone="emerald" icon={<CalendarPlus className="size-5" />} />
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Paciente *">
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required className="select">
              <option value="">Selecione…</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </Field>
          <Field label="Procedimento">
            <select value={procedureId} onChange={(e) => setProcedureId(e.target.value)} className="select">
              <option value="">— Qualquer —</option>
              {procs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Profissional preferido">
            <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} className="select">
              <option value="">— Qualquer —</option>
              {pros.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </Field>
          <Field label="Período preferido">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select">
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Observações" full>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="select" />
          </Field>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button disabled={saving} className="bg-brand text-brand-foreground font-bold px-5 py-2 rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar paciente…"
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Nenhum paciente na fila.</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Paciente</th>
                <th className="text-left px-4 py-3">Procedimento</th>
                <th className="text-left px-4 py-3">Prefere</th>
                <th className="text-left px-4 py-3">Aguardando há</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const days = Math.floor((Date.now() - new Date(i.created_at).getTime()) / 86400000);
                return (
                  <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{i.patients?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{i.patients?.phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.procedures?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {i.profiles?.full_name ? `Dr(a). ${i.profiles.full_name}` : "Qualquer"}<br />
                      {PERIODS.find((p) => p.value === i.preferred_period)?.label ?? "Qualquer"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{days === 0 ? "Hoje" : `${days}d`}</td>
                    <td className="px-4 py-3">
                      <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)}
                        className="bg-secondary border border-border rounded-md text-xs px-2 py-1 focus:outline-none">
                        <option value="waiting">Aguardando</option>
                        <option value="contacted">Contatado</option>
                        <option value="scheduled">Agendado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(i.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`.select{width:100%;background:hsl(var(--secondary));border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem}.select:focus{outline:none;border-color:hsl(var(--brand))}`}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function KPI({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: React.ReactNode }) {
  const tones: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`size-12 rounded-xl border grid place-items-center ${tones[tone]}`}>{icon}</div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}
