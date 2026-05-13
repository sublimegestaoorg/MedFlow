import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Calendar, FileText, Image as ImageIcon, Mic, MoreVertical,
  Phone, Plus, Stethoscope, History, Loader2, Activity, FilePlus2, Play
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pacientes/$id")({
  component: ProntuarioPaciente,
});

type Vitals = { bp?: string; temp?: string; hr?: string; weight?: string };
type Note = { id: string; content: string; type: string | null; created_at: string; vitals: Vitals | null; profiles?: { full_name: string } | null };
type TabKey = "evolution" | "exams" | "prescriptions" | "images" | "anamnese";

const TABS: { key: TabKey; label: string }[] = [
  { key: "evolution", label: "Evolução" },
  { key: "exams", label: "Exames" },
  { key: "prescriptions", label: "Prescrições" },
  { key: "images", label: "Imagens" },
  { key: "anamnese", label: "Anamnese" },
];

function ProntuarioPaciente() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("evolution");

  const [noteContent, setNoteContent] = useState("");
  const [vitals, setVitals] = useState<Vitals>({});
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => { fetchPatientData(); }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    const [patientRes, notesRes, aptCountRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase.from("clinical_notes").select("id, content, type, created_at, vitals, profiles(full_name)").eq("patient_id", id).order("created_at", { ascending: false }),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", id),
    ]);

    if (patientRes.data) setPatient(patientRes.data);
    setNotes((notesRes.data as any) || []);
    setAppointmentsCount(aptCountRes.count || 0);
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) { toast.error("O registro não pode estar vazio."); return; }
    setSavingNote(true);
    const cleanVitals = Object.fromEntries(Object.entries(vitals).filter(([, v]) => v && v.trim()));
    const { error } = await supabase.from("clinical_notes").insert({
      patient_id: id,
      content: noteContent,
      type: "evolution",
      vitals: Object.keys(cleanVitals).length > 0 ? cleanVitals : null,
    });
    setSavingNote(false);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Evolução salva.");
    setNoteContent(""); setVitals({});
    fetchPatientData();
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-background rounded-2xl"><Loader2 className="size-8 animate-spin text-brand" /></div>;
  if (!patient) return <div className="h-full flex items-center justify-center bg-background rounded-2xl">Paciente não encontrado.</div>;

  const age = patient.birth_date ? Math.floor((Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;
  const lastVitals = notes.find((n) => n.vitals)?.vitals || {};

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl">
      {/* Header */}
      <div className="bg-card border-b border-border p-6 rounded-t-2xl shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate({ to: "/app/pacientes" })} className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors self-start mt-1">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex gap-4 items-center">
              <div className="size-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 font-bold text-2xl flex items-center justify-center">
                {patient.full_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3 flex-wrap">
                  {patient.full_name}
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-500/20">Ativo</span>
                  {age !== null && <span className="text-xs text-muted-foreground font-normal">{age} anos · {patient.gender || "—"}</span>}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString("pt-BR") : "—"}</span>
                  <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{patient.phone || "Sem telefone"}</span>
                  <span className="flex items-center gap-1.5"><Activity className="size-3.5" />{appointmentsCount} consultas</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2">
              <FilePlus2 className="size-4" /> Prescrição
            </button>
            <button className="border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2">
              <FileText className="size-4" /> Atestado
            </button>
            <button className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600/30 transition-colors flex items-center gap-2">
              <Play className="size-4" /> Iniciar consulta
            </button>
            <button className="p-2.5 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><MoreVertical className="size-5" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card/50 p-6 overflow-y-auto hidden lg:block">
          <h3 className="font-bold font-display text-xs uppercase tracking-wider text-muted-foreground mb-4">Dados pessoais</h3>
          <div className="bg-background border border-border rounded-xl p-4 shadow-sm space-y-2 text-sm">
            <Row k="Nascimento" v={patient.birth_date ? new Date(patient.birth_date).toLocaleDateString("pt-BR") : "—"} />
            <Row k="Telefone" v={patient.phone || "—"} />
            <Row k="Email" v={patient.email || "—"} />
            <Row k="CPF" v={patient.cpf || "—"} />
            <Row k="Alergias" v={<span className="text-rose-400 font-medium">{patient.notes || "—"}</span>} />
          </div>

          <h3 className="font-bold font-display text-xs uppercase tracking-wider text-muted-foreground mt-6 mb-4">Histórico</h3>
          <ul className="space-y-3">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id} className="flex gap-3 items-start text-sm">
                <span className="size-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</div>
                  <div className="font-medium leading-tight line-clamp-2">{n.content}</div>
                </div>
              </li>
            ))}
            {notes.length === 0 && <li className="text-xs text-muted-foreground">Nenhum registro ainda.</li>}
          </ul>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col bg-background relative">
          <div className="flex gap-6 px-8 border-b border-border bg-card/50 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`py-4 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "text-blue-400 border-b-2 border-blue-400 font-bold" : "text-muted-foreground hover:text-foreground"}`}
              >{t.label}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {tab === "evolution" ? (
              <div className="max-w-4xl">
                {/* Vitals cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <VitalCard label="Pressão (mmHg)" value={lastVitals.bp} placeholder="120/80" onChange={(v) => setVitals({ ...vitals, bp: v })} current={vitals.bp} />
                  <VitalCard label="Temperatura" value={lastVitals.temp} placeholder="36,5°" onChange={(v) => setVitals({ ...vitals, temp: v })} current={vitals.temp} />
                  <VitalCard label="Freq. cardíaca" value={lastVitals.hr} placeholder="72 bpm" onChange={(v) => setVitals({ ...vitals, hr: v })} current={vitals.hr} />
                  <VitalCard label="Peso" value={lastVitals.weight} placeholder="68 kg" onChange={(v) => setVitals({ ...vitals, weight: v })} current={vitals.weight} />
                </div>

                {/* New note */}
                <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden focus-within:border-blue-500/50 transition-colors">
                  <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground border-b border-border/60">
                    Nova evolução — hoje, {new Date().toLocaleDateString("pt-BR")}
                  </div>
                  <div className="p-4">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Descreva o atendimento, queixas, condutas e orientações..."
                      className="w-full bg-transparent resize-none outline-none text-sm min-h-[140px] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="bg-secondary/50 border-t border-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconBtn title="Ditar por voz (em breve)"><Mic className="size-4" /></IconBtn>
                      <IconBtn title="Anexar imagem"><ImageIcon className="size-4" /></IconBtn>
                      <IconBtn title="Usar template"><FileText className="size-4" /></IconBtn>
                    </div>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteContent.trim()}
                      className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingNote && <Loader2 className="size-4 animate-spin" />}
                      Salvar evolução
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <h3 className="font-bold font-display text-lg mb-5 flex items-center gap-2">
                  <History className="size-5 text-muted-foreground" />
                  Histórico de atendimentos
                </h3>
                {notes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    Nenhum registro clínico encontrado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((n) => (
                      <article key={n.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                        <header className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                              <Stethoscope className="size-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="font-bold text-sm">{n.profiles?.full_name || "Profissional"}</div>
                              <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                            {n.type === "evolution" ? "Evolução" : n.type || "Registro"}
                          </span>
                        </header>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{n.content}</p>
                        {n.vitals && Object.keys(n.vitals).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                            {n.vitals.bp && <Tag>PA {n.vitals.bp}</Tag>}
                            {n.vitals.temp && <Tag>{n.vitals.temp}</Tag>}
                            {n.vitals.hr && <Tag>{n.vitals.hr}</Tag>}
                            {n.vitals.weight && <Tag>{n.vitals.weight}</Tag>}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyTab tab={tab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-2"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span></div>;
}
function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return <button title={title} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">{children}</button>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-1 rounded-md text-xs bg-secondary border border-border font-medium">{children}</span>;
}
function VitalCard({ label, value, current, placeholder, onChange }: { label: string; value?: string; current?: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
      <input
        value={current ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={value || placeholder}
        className="w-full bg-transparent text-lg font-bold mt-1 outline-none placeholder:text-muted-foreground/40"
      />
      {value && !current && <div className="text-[10px] text-muted-foreground mt-0.5">último: {value}</div>}
    </div>
  );
}
function EmptyTab({ tab }: { tab: TabKey }) {
  const labels: Record<TabKey, string> = {
    evolution: "Evolução",
    exams: "Exames laboratoriais e de imagem",
    prescriptions: "Prescrições e receitas",
    images: "Imagens (antes/depois, raio-x, fotos clínicas)",
    anamnese: "Ficha de anamnese e histórico de saúde",
  };
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="size-14 rounded-2xl bg-secondary border border-border grid place-items-center mx-auto mb-4">
        <Plus className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-display font-bold text-lg">{labels[tab]}</h3>
      <p className="text-sm text-muted-foreground mt-2">Esta aba será ativada na <strong>Fase 2</strong> do roadmap, junto com templates por especialidade e odontograma interativo.</p>
    </div>
  );
}
