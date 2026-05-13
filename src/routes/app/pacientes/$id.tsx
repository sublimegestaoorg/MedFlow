import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Calendar, Clock, FileText, Image as ImageIcon, 
  MessageSquare, Mic, MoreVertical, Phone, Plus, 
  Stethoscope, AlertTriangle, History, Activity, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pacientes/$id")({
  component: ProntuarioPaciente,
});

function ProntuarioPaciente() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Note state
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    // Fetch patient details
    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (patientData) {
      setPatient(patientData);
    }

    // Fetch clinical notes
    const { data: notesData } = await supabase
      .from('clinical_notes')
      .select('id, content, type, created_at, profiles(full_name)')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    // Format for timeline
    const formattedTimeline = (notesData || []).map((note) => ({
      id: note.id,
      date: new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: note.type === 'evolution' ? 'Evolução' : note.type,
      prof: note.profiles?.full_name || "Profissional",
      text: note.content
    }));

    setTimeline(formattedTimeline);
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      toast.error("O registro não pode estar vazio.");
      return;
    }

    setSavingNote(true);

    // TODO: In a real app, you get the authenticated professional_id. 
    // Here we'll just insert without it or use a default if we had one.
    const { error } = await supabase.from('clinical_notes').insert({
      patient_id: id,
      content: noteContent,
      type: 'evolution'
    });

    setSavingNote(false);

    if (error) {
      toast.error("Erro ao salvar evolução: " + error.message);
      return;
    }

    toast.success("Evolução salva com sucesso!");
    setNoteContent("");
    fetchPatientData(); // Reload timeline
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-background rounded-2xl"><Loader2 className="size-8 animate-spin text-brand" /></div>;
  }

  if (!patient) {
    return <div className="h-full flex items-center justify-center bg-background rounded-2xl">Paciente não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl">
      {/* Header do Prontuário */}
      <div className="bg-card border-b border-border p-6 rounded-t-2xl shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate({ to: "/app/pacientes" })} className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors self-start mt-1">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex gap-4 items-center">
              <div className="size-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 font-bold text-2xl flex items-center justify-center">
                {patient.full_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
                  {patient.full_name}
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-500/20">
                    Ativo
                  </span>
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> 
                    {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : 'Data n/a'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" /> 
                    {patient.phone || 'Sem telefone'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600/30 transition-colors flex items-center gap-2">
              <Plus className="size-4" />
              Agendar
            </button>
            <button className="p-2.5 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Coluna Esquerda - Resumo Clínico */}
        <div className="w-80 border-r border-border bg-card/50 p-6 overflow-y-auto hidden lg:block">
          <h3 className="font-bold font-display text-sm uppercase tracking-wider text-muted-foreground mb-4">Resumo Clínico</h3>
          
          <div className="space-y-6">
            {/* ... Conteúdo mockado para UX ... */}
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
               <h4 className="font-bold text-sm mb-3">Dados Cadastrais</h4>
               <ul className="text-sm text-muted-foreground space-y-2">
                 <li><strong>Email:</strong> {patient.email || '-'}</li>
                 <li><strong>CPF:</strong> {patient.cpf || '-'}</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Coluna Central - Evolução e Timeline */}
        <div className="flex-1 flex flex-col bg-background relative">
          
          {/* Abas */}
          <div className="flex gap-6 px-8 border-b border-border bg-card/50">
            <button className="py-4 text-sm font-bold text-blue-400 border-b-2 border-blue-400">Evolução Clínica</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Odontograma</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Imagens</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Receitas</button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
            {/* Input de Nova Evolução */}
            <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <div className="p-4">
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Registre a evolução de hoje. O que o paciente relatou? Qual o exame físico?..."
                  className="w-full bg-transparent resize-none outline-none text-sm min-h-[120px] placeholder:text-muted-foreground/60"
                ></textarea>
              </div>
              <div className="bg-secondary/50 border-t border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" title="Ditar por voz (IA)">
                    <Mic className="size-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" title="Adicionar anexo">
                    <ImageIcon className="size-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" title="Usar template">
                    <FileText className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteContent.trim()}
                    className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingNote && <Loader2 className="size-4 animate-spin" />}
                    Salvar Evolução
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline de Histórico */}
            <div>
              <h3 className="font-bold font-display text-lg mb-6 flex items-center gap-2">
                <History className="size-5 text-muted-foreground" />
                Histórico de Atendimentos
              </h3>
              
              {timeline.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                  Nenhum registro clínico encontrado para este paciente.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  
                  {timeline.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Marcador */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        <Stethoscope className="size-4 text-blue-400" />
                      </div>
                      
                      {/* Card de Conteúdo */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-5 rounded-2xl shadow-sm group-hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                            {item.type}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">{item.date}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-2">{item.prof}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
