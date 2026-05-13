import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Save, Smartphone, Shield, Building2 } from "lucide-react";

export const Route = createFileRoute("/app/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Configurações da Clínica</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os dados da clínica, automações e segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Menu Lateral de Configurações */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-xl font-bold text-sm transition-colors text-left">
            <Building2 className="size-4" /> Dados Gerais
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-xl font-medium text-sm transition-colors text-left">
            <Smartphone className="size-4" /> Automação (WhatsApp)
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-xl font-medium text-sm transition-colors text-left">
            <Shield className="size-4" /> Permissões
          </button>
        </div>

        {/* Área de Conteúdo */}
        <div className="md:col-span-3 space-y-6">
          {/* Painel de WhatsApp */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Automação de WhatsApp</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure sua API para enviar lembretes aos pacientes.</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Provedor da API</label>
                <select className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none">
                  <option value="z-api">Z-API</option>
                  <option value="evolution">Evolution API</option>
                  <option value="wpp-cloud">WhatsApp Cloud API Oficial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">URL da Instância / Base URL</label>
                <input 
                  type="text" 
                  placeholder="https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none placeholder:text-muted-foreground/40 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Client-Token / Security Token</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••••••••••" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none font-mono"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                <div className="text-blue-400 font-bold mt-0.5">ℹ️</div>
                <div>
                  <h4 className="text-sm font-bold text-blue-400">Como funciona?</h4>
                  <p className="text-xs text-blue-400/80 mt-1">
                    Ao salvar essas credenciais, sempre que você criar um "Novo Agendamento" ou mudar o status para "Confirmado", o MedFlow disparará uma notificação silenciosa pelo seu WhatsApp para o paciente.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-secondary/20 flex justify-end">
              <button className="flex items-center gap-2 bg-brand text-brand-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-sm">
                <Save className="size-4" /> Salvar Integração
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
