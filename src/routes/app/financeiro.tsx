import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  Plus, Filter, Download, Search, Loader2, TrendingUp 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { NovaTransacaoModal } from "@/components/NovaTransacaoModal";

export const Route = createFileRoute("/app/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const [activeTab, setActiveTab] = useState("fluxo"); // fluxo | comissoes
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States para novo lançamento (Modal simplificado in-page ou popup)
  const [showNovaTransacao, setShowNovaTransacao] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*, profiles(full_name), patients(full_name)")
      .order("date", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  // Mock data se banco vazio
  const displayData = transactions.length > 0 ? transactions : [
    { id: "1", description: "Consulta - Dra. Ana", amount: 350.00, type: "income", date: "2026-05-13", category: "Consulta", status: "paid" },
    { id: "2", description: "Procedimento Botox", amount: 1200.00, type: "income", date: "2026-05-12", category: "Estética", status: "paid" },
    { id: "3", description: "Conta de Luz", amount: 450.00, type: "expense", date: "2026-05-10", category: "Fixa", status: "paid" },
    { id: "4", description: "Materiais Odonto", amount: 890.00, type: "expense", date: "2026-05-08", category: "Suprimentos", status: "paid" },
    { id: "5", description: "Manutenção Ar Condicionado", amount: 200.00, type: "expense", date: "2026-05-05", category: "Manutenção", status: "pending" },
  ];

  // Calculos
  const totalReceitas = displayData.filter(t => t.type === 'income' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalDespesas = displayData.filter(t => t.type === 'expense' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;
  const aReceber = displayData.filter(t => t.type === 'income' && t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);

  // Comissões mockadas para visão
  const comissoes = [
    { prof: "Dra. Ana", totalProduzido: 4500, percentual: 40, valorComissao: 1800, status: "Pendente" },
    { prof: "Dr. Carlos", totalProduzido: 3200, percentual: 40, valorComissao: 1280, status: "Pago" },
    { prof: "Dra. Lúcia", totalProduzido: 1500, percentual: 30, valorComissao: 450, status: "Pendente" },
  ];

  return (
    <div className="space-y-6 relative">
      <NovaTransacaoModal 
        isOpen={showNovaTransacao} 
        onClose={() => setShowNovaTransacao(false)} 
        onSuccess={fetchTransactions}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral do caixa e comissionamento.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-xl font-bold hover:bg-secondary transition-colors text-sm">
            <Download className="size-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowNovaTransacao(true)}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm text-sm"
          >
            <Plus className="size-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-muted-foreground text-sm font-medium">Saldo Atual</h3>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Wallet className="size-4" /></div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Contas pagas</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-muted-foreground text-sm font-medium">Receitas (Mês)</h3>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ArrowUpRight className="size-4" /></div>
          </div>
          <div className="text-3xl font-bold mb-1 text-emerald-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas)}
          </div>
          <p className="text-xs text-muted-foreground font-medium">100% recebido</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-muted-foreground text-sm font-medium">Despesas (Mês)</h3>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><ArrowDownRight className="size-4" /></div>
          </div>
          <div className="text-3xl font-bold mb-1 text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Em dia</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-muted-foreground text-sm font-medium">A Receber</h3>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><DollarSign className="size-4" /></div>
          </div>
          <div className="text-3xl font-bold mb-1 text-amber-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aReceber)}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Boletos/Pix pendentes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button 
          onClick={() => setActiveTab('fluxo')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'fluxo' ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Fluxo de Caixa
        </button>
        <button 
          onClick={() => setActiveTab('comissoes')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'comissoes' ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Comissões da Equipe
        </button>
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        
        {activeTab === 'fluxo' && (
          <>
            <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar transação..." 
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none w-full md:w-auto">
                  <option>Maio 2026</option>
                  <option>Abril 2026</option>
                </select>
                <button className="p-2 bg-background border border-border rounded-xl hover:bg-secondary">
                  <Filter className="size-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Data</th>
                    <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Descrição</th>
                    <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Categoria</th>
                    <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">Valor</th>
                    <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayData.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-foreground">{t.description}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {t.category}
                      </td>
                      <td className="p-4 text-right font-bold text-sm">
                        <span className={t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}>
                          {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {t.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'comissoes' && (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="size-5 text-brand" />
              Resumo de Produção (Maio 2026)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comissoes.map((c, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${c.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-4">{c.prof}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Produzido</span>
                      <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.totalProduzido)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-3">
                      <span className="text-muted-foreground">Regra (%)</span>
                      <span className="font-medium text-blue-400">{c.percentual}%</span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                      <span className="text-sm font-medium">Repasse</span>
                      <span className="font-bold text-xl text-emerald-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valorComissao)}
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-5 bg-secondary text-foreground hover:bg-border font-bold py-2 rounded-lg text-sm transition-colors">
                    Ver Detalhamento
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
