import { useState } from "react";
import { X, User, Phone, Mail, FileText, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface NovoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoPacienteModal({ isOpen, onClose, onSuccess }: NovoPacienteModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error("O nome completo é obrigatório.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("patients").insert({
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      cpf: cpf || null,
      birth_date: birthDate || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao cadastrar paciente: " + error.message);
      return;
    }

    toast.success("Paciente cadastrado com sucesso!");
    
    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setBirthDate("");
    
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
          <h2 className="text-xl font-bold font-display text-foreground">Novo Paciente</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="paciente-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="size-4 text-brand" /> Nome Completo *
              </label>
              <input 
                type="text"
                placeholder="Ex: Amanda Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="size-4 text-brand" /> Telefone
                </label>
                <input 
                  type="tel" 
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-brand" /> Nascimento
                </label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none color-scheme-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Email */}
               <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="size-4 text-brand" /> E-mail
                </label>
                <input 
                  type="email" 
                  placeholder="paciente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* CPF */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-brand" /> CPF
                </label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

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
            form="paciente-form"
            disabled={loading || !fullName}
            className="flex items-center gap-2 bg-brand text-brand-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm disabled:opacity-70"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Cadastrar Paciente
          </button>
        </div>
      </div>
    </div>
  );
}
