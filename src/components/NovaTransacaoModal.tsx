import { useState, useEffect } from "react";
import { X, DollarSign, FileText, Calendar, Tag, ArrowUpRight, ArrowDownRight, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface NovaTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovaTransacaoModal({ isOpen, onClose, onSuccess }: NovaTransacaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Form state
  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Consulta");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [professionalId, setProfessionalId] = useState("");

  // Categories based on type
  const incomeCategories = ["Consulta", "Procedimento", "Estética", "Exame", "Outros"];
  const expenseCategories = ["Fixa (Luz/Água/Net)", "Suprimentos/Materiais", "Manutenção", "Marketing", "Impostos", "Salários", "Comissões", "Outros"];

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      // Set default date to today
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) setProfiles(data);
  };

  // Convert localized string like "1.200,50" to float 1200.50 if needed, but we'll ask for simple numbers for MVP.
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    const numericAmount = parseFloat(amount.replace(",", "."));

    const { error } = await supabase.from("transactions").insert({
      description,
      amount: numericAmount,
      type,
      category,
      date,
      status,
      professional_id: professionalId || null
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao salvar transação: " + error.message);
      return;
    }

    toast.success("Transação salva com sucesso!");
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="text-xl font-bold font-display text-foreground">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Tipo Selector */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => { setType("income"); setCategory(incomeCategories[0]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                type === "income" 
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <ArrowUpRight className="size-5" /> Receita
            </button>
            <button 
              onClick={() => { setType("expense"); setCategory(expenseCategories[0]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                type === "expense" 
                ? "border-red-500 bg-red-500/10 text-red-500" 
                : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <ArrowDownRight className="size-5" /> Despesa
            </button>
          </div>

          <form id="transacao-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-brand" /> Descrição
              </label>
              <input 
                type="text"
                placeholder={type === "income" ? "Ex: Consulta Particular" : "Ex: Conta de Luz"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="size-4 text-brand" /> Valor (R$)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                  required
                />
              </div>

              {/* Data */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-brand" /> Data
                </label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none color-scheme-dark"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tag className="size-4 text-brand" /> Categoria
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                >
                  {(type === "income" ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Status
                </label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                >
                  <option value="paid">{type === "income" ? "Recebido" : "Pago"}</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>

            {/* Profissional (Opcional, útil para comissões) */}
            {type === "income" && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="size-4 text-brand" /> Vincular Profissional (Para Comissão)
                </label>
                <select 
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                >
                  <option value="">Nenhum (Receita da Clínica)</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Se vinculado, este valor entrará no cálculo automático de produção do profissional.</p>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/10">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="transacao-form"
            disabled={loading}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Salvar Transação
          </button>
        </div>
      </div>
    </div>
  );
}
