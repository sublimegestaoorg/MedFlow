import { createFileRoute } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Mic, 
  MoreVertical, 
  Phone, 
  Plus, 
  Stethoscope, 
  AlertTriangle,
  History,
  Activity
} from "lucide-react";

export const Route = createFileRoute("/app/pacientes/$id")({
  component: ProntuarioPaciente,
});

const historico = [
  { id: 1, date: "13 Mai 2026", type: "Retorno", prof: "Dra. Ana", text: "Paciente apresentou melhora no quadro de inflamação. Mantida a prescrição atual por mais 15 dias." },
  { id: 2, date: "28 Abr 2026", type: "Primeira Consulta", prof: "Dra. Ana", text: "Queixa principal: dores de cabeça constantes e tensão cervical. Realizada anamnese completa. Solicitado exames de sangue gerais." },
];

function ProntuarioPaciente() {
  return (
    <div className="flex flex-col h-full bg-background rounded-2xl">
      {/* Header do Prontuário */}
      <div className="bg-card border-b border-border p-6 rounded-t-2xl shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors self-start mt-1">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex gap-4 items-center">
              <div className="size-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 font-bold text-2xl flex items-center justify-center">
                AS
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
                  Amanda Silva
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-500/20">
                    Ativa
                  </span>
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> 28 anos (15/04/1998)</span>
                  <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> (11) 98765-4321</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> Última consulta: Hoje</span>
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
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <AlertTriangle className="size-4" /> Alergias
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Dipirona</li>
                <li>Amendoim</li>
              </ul>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                <Activity className="size-4" /> Uso Contínuo
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Losartana 50mg</li>
              </ul>
            </div>

            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
               <h4 className="font-bold text-sm mb-3">Tags do Paciente</h4>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-secondary rounded-md text-xs text-muted-foreground border border-border/50">Particular</span>
                 <span className="px-2 py-1 bg-secondary rounded-md text-xs text-muted-foreground border border-border/50">VIP</span>
               </div>
            </div>
          </div>
        </div>

        {/* Coluna Central - Evolução e Timeline */}
        <div className="flex-1 flex flex-col bg-background relative">
          
          {/* Abas */}
          <div className="flex gap-6 px-8 border-b border-border bg-card/50">
            <button className="py-4 text-sm font-bold text-blue-400 border-b-2 border-blue-400">Evolução Clínica</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Odontograma</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Imagens (4)</button>
            <button className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Receitas</button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
            {/* Input de Nova Evolução */}
            <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <div className="p-4">
                <textarea 
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
                  <span className="text-xs text-muted-foreground hidden sm:block">Draft salvo às 10:42</span>
                  <button className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors">
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
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                
                {historico.map((item) => (
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
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                      
                      {/* Interações pós-card */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs text-muted-foreground flex items-center gap-1.5"><MessageSquare className="size-3" /> 0 comentários</span>
                         <button className="text-xs font-medium text-blue-400 hover:text-blue-300">Editar</button>
                      </div>
                    </div>
                  </div>
                ))}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
