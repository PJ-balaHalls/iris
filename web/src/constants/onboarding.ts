// web/src/constants/onboarding.ts
export const IRIS_INTERNAL_DOMAIN = "iris.com";

export const internalRoles = [
  {
    value: "design",
    label: "Design",
    description: "Produto, interface, pesquisa, acessibilidade e sistema visual.",
  },
  {
    value: "partner",
    label: "Parceiro",
    description: "Relacionamento, alianças, canais, performance e integrações.",
  },
  {
    value: "dev",
    label: "Dev",
    description: "Engenharia, dados, segurança, API, mobile e infraestrutura.",
  },
] as const;

export const internalTeamsByRole = {
  dev: [
    { value: "backend", label: "Backend", description: "APIs, banco, regras de negócio e Supabase." },
    { value: "frontend", label: "Frontend", description: "Web, admin, interface e experiência." },
    { value: "mobile", label: "Mobile", description: "Expo, React Native, lojas e performance nativa." },
    { value: "data", label: "Dados", description: "Métricas, analytics, qualidade e modelagem." },
    { value: "platform", label: "Plataforma", description: "Base técnica comum, DX, pacotes e arquitetura." },
    { value: "devops", label: "DevOps", description: "Deploy, observabilidade, CI/CD e ambientes." },
    { value: "security", label: "Segurança", description: "RLS, auditoria, chaves, privacidade e incidentes." },
    { value: "ai_ml", label: "IA / ML", description: "Aurora, embeddings, RAG, moderação e automações." },
    { value: "qa", label: "QA", description: "Testes, validação de fluxo e estabilidade." },
    { value: "api_integrations", label: "API & Integrações", description: "Webhooks, conectores e integrações externas." },
  ],
  design: [
    { value: "ux_ui", label: "UX/UI", description: "Fluxos, telas, jornadas e experiência do usuário." },
    { value: "design_system", label: "Design System", description: "Tokens, componentes, padrões e governança visual." },
    { value: "research", label: "Pesquisa", description: "Entrevistas, testes, comportamento e descoberta." },
    { value: "brand", label: "Brand", description: "Identidade, linguagem visual, marca e direção artística." },
    { value: "motion", label: "Motion", description: "Microinterações, transições e conforto cognitivo." },
    { value: "content_design", label: "Content Design", description: "Texto, tom, microcopy e clareza emocional." },
    { value: "accessibility", label: "Acessibilidade", description: "Inclusão, contraste, leitura e navegação assistiva." },
  ],
  partner: [
    { value: "channels", label: "Canais", description: "Gestão de canais, relacionamento e distribuição." },
    { value: "alliances", label: "Alianças", description: "Parcerias estratégicas, acordos e expansão." },
    { value: "integrations", label: "Integrações", description: "Parceiros técnicos, conectores e implantação." },
    { value: "customer_success", label: "Customer Success", description: "Acompanhamento, adoção e saúde de contas." },
    { value: "sales_ops", label: "Sales Ops", description: "Operação comercial, funil e métricas." },
    { value: "legal_compliance", label: "Jurídico & Compliance", description: "Contratos, termos, LGPD e governança." },
    { value: "ecosystem", label: "Ecossistema", description: "Marketplace, criadores, agentes e comunidade." },
  ],
} as const;

export const externalAccountTypes = [
  {
    value: "final_customer",
    label: "Uso pessoal / iLife",
    description: "Conta comum, sem vínculo institucional. Ideal para experiência pessoal do ecossistema.",
  },
  {
    value: "business_partner",
    label: "Empresa / parceiro",
    description: "Conta vinculada a uma organização, projetos, contratos e permissões corporativas.",
  },
  {
    value: "supplier",
    label: "Fornecedor",
    description: "Acesso a demandas, entregas e documentos autorizados.",
  },
  {
    value: "service_provider",
    label: "Prestador de serviço",
    description: "Acesso operacional limitado aos serviços contratados.",
  },
] as const;

export const organizationRelations = [
  {
    value: "owner",
    label: "Sou dona(o) / responsável legal",
    description: "Posso cadastrar e confirmar dados da organização.",
  },
  {
    value: "employee",
    label: "Sou funcionária(o)",
    description: "Solicitarei associação à organização. O dono deverá aprovar.",
  },
] as const;

export const organizationSegments = [
  { value: "technology", label: "Tecnologia" },
  { value: "education", label: "Educação" },
  { value: "culture", label: "Cultura" },
  { value: "health", label: "Saúde" },
  { value: "retail", label: "Varejo" },
  { value: "services", label: "Serviços" },
  { value: "industry", label: "Indústria" },
  { value: "finance", label: "Financeiro" },
  { value: "public_sector", label: "Setor público" },
  { value: "other", label: "Outro" },
] as const;

export const businessPositions = [
  {
    value: "owner",
    label: "Dona(o) / Sócia(o)",
    description: "Responsável pela organização ou por sua assinatura.",
  },
  {
    value: "director",
    label: "Direção",
    description: "Diretor, gestor executivo ou liderança principal.",
  },
  {
    value: "manager",
    label: "Gerência",
    description: "Gestão operacional, projeto, área ou equipe.",
  },
  {
    value: "analyst",
    label: "Analista",
    description: "Atuação técnica, administrativa ou operacional.",
  },
  {
    value: "finance",
    label: "Financeiro",
    description: "Pagamentos, contratos, documentos e conciliações.",
  },
  {
    value: "support",
    label: "Suporte / Operação",
    description: "Atendimento, suporte, implantação ou operação.",
  },
] as const;

export const notificationChannels = [
  {
    value: "internal_email",
    label: "E-mail interno",
    description: "Ideal para comunicados formais, aprovações e relatórios.",
  },
  {
    value: "browser_push",
    label: "Push no navegador",
    description: "Avisos rápidos quando o painel estiver aberto ou autorizado.",
  },
  {
    value: "slack_teams",
    label: "Slack / Teams",
    description: "Integração futura para times internos e canais de operação.",
  },
  {
    value: "admin_inbox",
    label: "Inbox do Admin",
    description: "Central silenciosa de notificações dentro do próprio painel.",
  },
] as const;

export const notificationFrequencies = [
  { value: "instant", label: "Instantânea" },
  { value: "daily_digest", label: "Resumo diário" },
  { value: "weekly_digest", label: "Resumo semanal" },
] as const;

export const notificationTopics = [
  {
    value: "new_requests",
    label: "Novas solicitações",
    description: "Quando uma nova demanda, revisão, projeto ou pedido entrar na fila.",
  },
  {
    value: "pending_approvals",
    label: "Aprovações pendentes",
    description: "Quando existir algo aguardando sua decisão ou validação.",
  },
  {
    value: "ready_reports",
    label: "Relatórios prontos",
    description: "Quando análises, exportações ou dashboards forem concluídos.",
  },
  {
    value: "security_events",
    label: "Eventos de segurança",
    description: "Alertas de login, permissões, chaves, políticas e riscos.",
  },
  {
    value: "integration_failures",
    label: "Falhas de integração",
    description: "Quando APIs, webhooks, jobs ou serviços externos falharem.",
  },
  {
    value: "design_reviews",
    label: "Revisões de design",
    description: "Pedidos de avaliação visual, tokens, componentes e consistência.",
  },
  {
    value: "partner_updates",
    label: "Atualizações de parceiros",
    description: "Mudanças em contas externas, contratos, canais e alianças.",
  },
  {
    value: "ai_moderation",
    label: "IA e moderação",
    description: "Sinais da Aurora, social engine, risco de conteúdo e revisões.",
  },
] as const;

export const tourCards = {
  dev: [
    "Logs, APIs, webhooks e status técnico.",
    "Observabilidade de Supabase, Edge Functions e integrações.",
    "Acesso por permissão para rotinas sensíveis.",
  ],
  design: [
    "Biblioteca de componentes e tokens do Design System NÓS.",
    "Solicitações de revisão visual e acessibilidade.",
    "Governança de consistência, contraste, microcopy e movimento.",
  ],
  partner: [
    "Métricas de parceria, canais e alianças.",
    "Indicadores de performance e adoção.",
    "Status de integrações, contratos e acompanhamento.",
  ],
  external: [
    "Projetos vinculados à sua organização.",
    "Solicitações, documentos e indicadores permitidos.",
    "Suporte, acompanhamento de status e termos específicos.",
  ],
} as const;
