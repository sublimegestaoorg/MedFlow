# ClinicPro — Roadmap de implementação

Você pediu **todos os 4 módulos** (Agendamento, Prontuário, Financeiro, CRM), **todas as 3 especialidades** (Odonto, Estética, Médica) e **só funcionalidades internas** (sem WhatsApp/NFS-e/Pagar.me agora).

Isso é grande demais para uma única entrega. Vou propor o roadmap abaixo e começar pela Fase 1 imediatamente quando você aprovar. Cada fase é entregue de uma vez e gera um produto utilizável de ponta a ponta.

---

## Fase 1 — Agendamento Inteligente (próxima entrega)

A agenda é o coração e tudo se conecta a ela, então aprofundamos primeiro.

- Cadastro de **Procedimentos/Serviços** por clínica (nome, duração, preço base, sala/recurso, especialidade)
- Calendário **semanal por profissional** + visão diária e mensal, drag-and-drop para mover/redimensionar
- **Detecção de conflito** de horário (mesmo profissional, mesma sala)
- Estados do agendamento: agendado → confirmado → em atendimento → concluído / cancelado / faltou
- **Fila de espera** por procedimento; ao cancelar, sugestão automática de quem chamar
- **Check-in digital** via link público (`/checkin/:codigo`) sem login
- **Mapa de calor** de horários ociosos da semana (heatmap) com sugestão de horários a promover
- Bloqueios de agenda (férias, almoço, indisponibilidade)

## Fase 2 — Prontuário Eletrônico

- Templates de **anamnese** por especialidade (Odonto, Estética, Médica)
- **Odontograma** interativo SVG (32 dentes, faces, status por face: cárie, restauração, ausente, tratamento previsto)
- **Plano de tratamento** odontológico por dente, com status por sessão e vínculo financeiro
- **Antes/depois** para Estética: upload de fotos pareadas com data e marcações
- Evolução textual por sessão + assinatura digital do paciente (canvas)
- Prescrição em PDF, atestados, encaminhamentos
- Termos de consentimento LGPD versionados

## Fase 3 — Financeiro Completo

- Plano de contas (categorias de receita/despesa)
- Lançamentos manuais e **automáticos** (cada agendamento concluído gera receita)
- Contas a pagar e a receber com vencimento e status
- **Pacotes de sessões** (10 sessões pré-pagas, decremento automático no atendimento)
- **Comissões** por profissional/procedimento, com fechamento mensal
- Fluxo de caixa diário/semanal/mensal e DRE simples
- Controle de estoque de insumos com alerta de mínimo

## Fase 4 — CRM, BI e Diferenciais

- Ficha 360° do paciente (histórico clínico + financeiro + comunicação + arquivos)
- Segmentação automática (inativos, aniversariantes, alto LTV, em risco de churn)
- **Score de churn** simples (último atendimento, frequência, cancelamentos)
- NPS pós-atendimento via link público
- Dashboard executivo com KPIs: ticket médio, taxa de ocupação, LTV, no-show, projeção de receita
- Insights automáticos por regra (ex: "cancelamentos subiram 18% às segundas")

---

## O que NÃO entra (conforme sua escolha "só funcionalidades internas")

- WhatsApp Business API, SMS, e-mail real
- Emissão real de NFS-e
- Gateways de pagamento (Stripe, Pagar.me, PIX real)
- Conciliação Open Finance
- IA generativa (transcrição por voz, chatbot)
- Teleconsulta (vídeo)
- App mobile nativo

Esses entram numa Fase 5 quando você liberar integrações pagas.

---

## Detalhes técnicos

- **Stack atual mantida**: TanStack Start + Supabase (Cloud) + Tailwind/shadcn + RLS multitenant por `clinic_id`.
- **Migrations novas** por fase: `procedures`, `appointment_status_log`, `waitlist`, `time_blocks`, `clinical_templates`, `odontogram_state`, `treatment_plans`, `treatment_items`, `before_after_photos`, `consent_signatures`, `account_categories`, `payables_receivables`, `packages`, `package_sessions`, `commissions`, `inventory_items`, `stock_movements`, `nps_responses`.
- Toda tabela nova herda RLS via `clinic_id = get_my_clinic_id()` e trigger `set_clinic_id_on_insert`.
- Frontend: rotas adicionais sob `/app/...` e rotas públicas `/checkin/:codigo` e `/nps/:codigo`.
- Sem novas dependências externas; uso de `recharts` (já no projeto) para BI.

---

## Pergunta de aprovação

Posso começar pela **Fase 1 — Agendamento Inteligente** agora? Essa fase sozinha é uma entrega substancial (≈ 8 telas/componentes novos + 4 migrations). Se preferir, me diga uma fase diferente para começar ou um subconjunto da Fase 1.