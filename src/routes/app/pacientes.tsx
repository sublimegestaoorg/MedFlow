import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Plus, Filter, MoreVertical, FileText, Phone, Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/pacientes")({
  component: Pacientes,
});

function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name');
    
    if (!error && data) {
      setPacientes(data);
    }
    setLoading(false);
  };

  // Mantém mock caso o banco esteja vazio
  const displayPacientes = pacientes.length > 0 ? pacientes.map(p => ({
    id: p.id,
    nome: p.full_name,
    email: p.email || "Sem e-mail",
    telefone: p.phone || "Sem telefone",
    ultimaConsulta: "Ver histórico",
    status: "Ativo"
  })) : [
    { id: '1', nome: "Amanda Silva", email: "amanda.silva@email.com", telefone: "(11) 98765-4321", ultimaConsulta: "13 Mai 2026", status: "Ativo" },
    { id: '2', nome: "Carlos Oliveira", email: "carlos.o@email.com", telefone: "(11) 91234-5678", ultimaConsulta: "05 Mai 2026", status: "Ativo" },
    { id: '3', nome: "Juliana Santos", email: "juh.santos@email.com", telefone: "(11) 99876-5432", ultimaConsulta: "12 Abr 2026", status: "Inativo" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie cadastros, prontuários e históricos.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand text-brand-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm">
          <Plus className="size-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl shadow-sm border border-border">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou telefone..." 
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-colors w-full md:w-auto justify-center">
            <Filter className="size-4" />
            <span>Filtros</span>
          </button>
          <button className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-colors w-full md:w-auto justify-center">
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {loading ? (
           <div className="p-12 flex justify-center"><Loader2 className="size-8 animate-spin text-brand" /></div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-12"></th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Paciente</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contato</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Última Consulta</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayPacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="p-4">
                    <div className="size-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-sm border border-brand/20">
                      {paciente.nome.charAt(0)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-foreground">{paciente.nome}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-1 items-center">
                       ID: #{paciente.id.toString().substring(0,6)}...
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-3.5 text-muted-foreground" />
                      <span>{paciente.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="size-3.5" />
                      <span>{paciente.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{paciente.ultimaConsulta}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      paciente.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                      paciente.status === 'Novo' ? 'bg-blue-100 text-blue-700' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {paciente.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate({ to: `/app/pacientes/${paciente.id}` })}
                        className="p-2 bg-white border border-border shadow-sm rounded-lg text-brand hover:bg-brand hover:text-white transition-colors" 
                        title="Abrir Prontuário"
                      >
                        <FileText className="size-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando registros da base de dados.</span>
        </div>
      </div>
    </div>
  );
}
