#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const cwd = process.cwd();

let webRoot = null;

if (fs.existsSync(path.join(cwd, "package.json")) && fs.existsSync(path.join(cwd, "src"))) {
  webRoot = cwd;
} else if (fs.existsSync(path.join(cwd, "web", "package.json"))) {
  webRoot = path.join(cwd, "web");
} else {
  console.error("ERRO: rode este setup na raiz /c/iris ou dentro de /c/iris/web.");
  process.exit(1);
}

function write(relativePath, content) {
  const filePath = path.join(webRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
  console.log("OK:", relativePath);
}

write("src/constants/onboarding.ts", String.raw`
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
`);

write("src/components/onboarding/utils.ts", String.raw`
// web/src/components/onboarding/utils.ts
export function getAccountScopeFromEmail(email: string): "internal" | "external" {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return domain === "iris.com" ? "internal" : "external";
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
}

export function onlyDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0, 3) + "." + digits.slice(3);
  if (digits.length <= 9) {
    return digits.slice(0, 3) + "." + digits.slice(3, 6) + "." + digits.slice(6);
  }

  return (
    digits.slice(0, 3) +
    "." +
    digits.slice(3, 6) +
    "." +
    digits.slice(6, 9) +
    "-" +
    digits.slice(9)
  );
}

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.slice(0, 2) + "." + digits.slice(2);
  if (digits.length <= 8) {
    return digits.slice(0, 2) + "." + digits.slice(2, 5) + "." + digits.slice(5);
  }
  if (digits.length <= 12) {
    return (
      digits.slice(0, 2) +
      "." +
      digits.slice(2, 5) +
      "." +
      digits.slice(5, 8) +
      "/" +
      digits.slice(8)
    );
  }

  return (
    digits.slice(0, 2) +
    "." +
    digits.slice(2, 5) +
    "." +
    digits.slice(5, 8) +
    "/" +
    digits.slice(8, 12) +
    "-" +
    digits.slice(12)
  );
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) return digits;

  return digits.slice(0, 5) + "-" + digits.slice(5);
}

export function calculateAge(birthDate: string | undefined): number | null {
  if (!birthDate) return null;

  const date = new Date(birthDate + "T00:00:00");

  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function getPasswordChecks(password: string, confirmPassword: string) {
  return [
    {
      key: "length",
      label: "Pelo menos 8 caracteres",
      valid: password.length >= 8,
    },
    {
      key: "lower",
      label: "Uma letra minúscula",
      valid: /[a-z]/.test(password),
    },
    {
      key: "upper",
      label: "Uma letra maiúscula",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "number",
      label: "Um número",
      valid: /[0-9]/.test(password),
    },
    {
      key: "match",
      label: "As senhas precisam ser iguais",
      valid: password.length > 0 && password === confirmPassword,
    },
  ];
}
`);

write("src/components/onboarding/step-indicator.tsx", String.raw`
// web/src/components/onboarding/step-indicator.tsx
import { CheckCircle2 } from "lucide-react";

type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-3 shadow-irisSm">
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-foreground-muted">
            Etapa {currentStep + 1} de {steps.length}
          </p>
          <p className="truncate text-xs font-medium text-foreground">
            {steps[currentStep]}
          </p>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: progress + "%" }}
          />
        </div>
      </div>

      <div className="hidden gap-2 md:grid md:grid-cols-6 xl:grid-cols-9">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <div
              key={step}
              className={[
                "flex items-center gap-2 rounded-xl px-3 py-2 transition",
                isActive ? "bg-accent/10" : "bg-transparent",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isActive
                    ? "border-accent bg-accent text-white"
                    : isDone
                      ? "border-accent bg-surface text-accent"
                      : "border-border bg-surface text-foreground-muted",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>

              <span
                className={[
                  "hidden truncate text-xs font-medium lg:inline",
                  isActive ? "text-foreground" : "text-foreground-muted",
                ].join(" ")}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

write("src/schemas/onboarding.schema.ts", String.raw`
// web/src/schemas/onboarding.schema.ts
import { z } from "zod";
import {
  botanicInclinationCodeSchema,
  imageTransformSchema,
} from "@/schemas/botanic/botanic-identity.schema";

export const accountScopeSchema = z.enum(["internal", "external"]);
export const internalRoleSchema = z.enum(["design", "partner", "dev"]);
export const internalTeamSchema = z.enum([
  "backend",
  "frontend",
  "mobile",
  "data",
  "ux_ui",
  "design_system",
  "research",
  "channels",
  "alliances",
  "integrations",
  "platform",
  "devops",
  "security",
  "ai_ml",
  "qa",
  "api_integrations",
  "brand",
  "motion",
  "content_design",
  "accessibility",
  "customer_success",
  "sales_ops",
  "legal_compliance",
  "ecosystem",
]);

export const externalAccountTypeSchema = z.enum([
  "final_customer",
  "business_partner",
  "supplier",
  "service_provider",
]);

export const organizationRelationSchema = z.enum(["owner", "employee"]);
export const organizationFlowSchema = z.enum(["none", "existing", "create"]);
export const organizationSegmentSchema = z.enum([
  "technology",
  "education",
  "culture",
  "health",
  "retail",
  "services",
  "industry",
  "finance",
  "public_sector",
  "other",
]);
export const businessPositionSchema = z.enum([
  "owner",
  "director",
  "manager",
  "analyst",
  "finance",
  "support",
]);

export const onboardingBaseSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  confirmPassword: z.string().min(8, "Confirme sua senha."),
  accountScope: accountScopeSchema,

  internalRole: internalRoleSchema.optional(),
  internalTeam: internalTeamSchema.optional(),

  hasInternalCreationKey: z.boolean().default(false),
  internalCreationKey: z.string().max(180, "A chave está maior que o limite permitido.").optional(),

  externalAccountType: externalAccountTypeSchema.optional(),

  organizationFlow: organizationFlowSchema.default("none"),
  organizationId: z.string().uuid().optional(),
  organizationName: z.string().optional(),
  organizationCnpj: z.string().optional(),
  organizationSegment: organizationSegmentSchema.optional(),
  organizationRelation: organizationRelationSchema.optional(),
  organizationAccessCode: z.string().max(120).optional(),

  businessPhone: z.string().optional(),
  businessPosition: businessPositionSchema.optional(),

  notificationChannels: z.array(z.string()).default([]),
  notificationFrequency: z.enum(["instant", "daily_digest", "weekly_digest"]),
  notificationTopics: z.array(z.string()).default([]),

  fullName: z.string().min(3, "Informe seu nome completo."),
  username: z
    .string()
    .min(3, "O @ precisa ter pelo menos 3 caracteres.")
    .max(24, "O @ precisa ter no máximo 24 caracteres.")
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underline."),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  cep: z.string().optional(),
  addressLine: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),

  botanicInclination: botanicInclinationCodeSchema.default("NULO"),

  profileBio: z.string().max(280, "A bio precisa ter no máximo 280 caracteres.").optional(),
  avatarPath: z.string().optional(),
  coverPath: z.string().optional(),
  avatarTransform: imageTransformSchema.optional(),
  coverTransform: imageTransformSchema.optional(),

  acceptedTerms: z.boolean(),
  acceptedPartnerTerms: z.boolean().optional(),
  allowTour: z.boolean().default(true),
});

export const onboardingServerPayloadBaseSchema = onboardingBaseSchema.omit({
  password: true,
  confirmPassword: true,
});

type ServerPayloadLike = z.infer<typeof onboardingServerPayloadBaseSchema>;

function isInstitutionalExternal(value: ServerPayloadLike) {
  return value.accountScope === "external" && value.externalAccountType !== "final_customer";
}

function validateOnboardingBusinessRules(value: ServerPayloadLike, ctx: z.RefinementCtx) {
  if (value.accountScope === "internal") {
    if (!value.internalRole) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["internalRole"],
        message: "Selecione sua função interna.",
      });
    }

    if (!value.internalTeam) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["internalTeam"],
        message: "Selecione seu time.",
      });
    }

    if (value.hasInternalCreationKey && !value.internalCreationKey?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["internalCreationKey"],
        message: "Informe a chave de criação ou desmarque a opção.",
      });
    }
  }

  if (value.accountScope === "external") {
    if (!value.externalAccountType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["externalAccountType"],
        message: "Selecione o tipo de conta.",
      });
    }

    if (isInstitutionalExternal(value)) {
      if (!value.organizationRelation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organizationRelation"],
          message: "Informe se você é dona(o) ou funcionária(o) da organização.",
        });
      }

      if (value.organizationFlow === "existing" && !value.organizationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organizationId"],
          message: "Selecione uma organização encontrada.",
        });
      }

      if (value.organizationFlow === "create" && (!value.organizationName || value.organizationName.trim().length < 2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organizationName"],
          message: "Informe o nome da organização.",
        });
      }

      if (!value.businessPosition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["businessPosition"],
          message: "Selecione seu papel na organização.",
        });
      }

      if (!value.acceptedPartnerTerms) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["acceptedPartnerTerms"],
          message: "Aceite os termos específicos para contas institucionais.",
        });
      }
    }
  }

  if (!value.acceptedTerms) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["acceptedTerms"],
      message: "Você precisa aceitar os termos para continuar.",
    });
  }
}

export const onboardingSchema = onboardingBaseSchema.superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "As senhas não conferem.",
    });
  }

  const { password: _password, confirmPassword: _confirmPassword, ...serverPayload } = value;
  validateOnboardingBusinessRules(serverPayload, ctx);
});

export const onboardingServerPayloadSchema =
  onboardingServerPayloadBaseSchema.superRefine(validateOnboardingBusinessRules);

export type OnboardingFormValues = z.infer<typeof onboardingBaseSchema>;
export type OnboardingServerPayload = z.infer<typeof onboardingServerPayloadBaseSchema>;
`);

write("src/components/onboarding/steps/step-account-kind.tsx", String.raw`
// web/src/components/onboarding/steps/step-account-kind.tsx
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { externalAccountTypes, internalRoles } from "@/constants/onboarding";
import { OptionList } from "@/components/ui/option-list";

export function StepAccountKind({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const internalRole = form.watch("internalRole");
  const externalAccountType = form.watch("externalAccountType");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Etapa 2
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          {accountScope === "internal" ? "Qual é sua função?" : "Como você quer entrar no IRÍS?"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {accountScope === "internal"
            ? "Essa escolha orienta permissões, dashboards e conteúdo interno."
            : "Usuários comuns não precisam cadastrar organização. Contas institucionais seguem validação separada."}
        </p>
      </div>

      <OptionList
        items={(accountScope === "internal" ? internalRoles : externalAccountTypes).map((item) => ({
          value: item.value,
          label: item.label,
          description: item.description,
        }))}
        value={accountScope === "internal" ? internalRole : externalAccountType}
        onChange={(value) => {
          if (accountScope === "internal") {
            form.setValue("internalRole", value as never, { shouldDirty: true });
            form.setValue("internalTeam", undefined, { shouldDirty: true });
          } else {
            form.setValue("externalAccountType", value as never, { shouldDirty: true });
            form.setValue("organizationFlow", "none", { shouldDirty: true });
            form.setValue("organizationId", undefined, { shouldDirty: true });
            form.setValue("organizationRelation", undefined, { shouldDirty: true });
          }
        }}
        columns={accountScope === "internal" ? 3 : 2}
      />
    </section>
  );
}
`);

write("src/components/onboarding/steps/step-team-or-organization.tsx", String.raw`
// web/src/components/onboarding/steps/step-team-or-organization.tsx
"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Search, X } from "lucide-react";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import {
  internalTeamsByRole,
  organizationRelations,
  organizationSegments,
} from "@/constants/onboarding";
import { formatCnpj, onlyDigits } from "@/components/onboarding/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionList } from "@/components/ui/option-list";
import { Select } from "@/components/ui/select";

type OrganizationSearchResult = {
  id: string;
  legalName: string;
  cnpj: string | null;
  segment: string | null;
  verificationStatus: string | null;
};

export function StepTeamOrOrganization({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const internalRole = form.watch("internalRole");
  const internalTeam = form.watch("internalTeam");
  const externalAccountType = form.watch("externalAccountType");
  const organizationRelation = form.watch("organizationRelation");
  const organizationCnpj = form.watch("organizationCnpj");
  const organizationName = form.watch("organizationName");
  const organizationId = form.watch("organizationId");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrganizationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const teams = internalRole
    ? internalTeamsByRole[internalRole].map((team) => ({
        value: team.value,
        label: team.label,
        description: team.description,
      }))
    : [];

  const isPersonalExternal = accountScope === "external" && externalAccountType === "final_customer";

  async function searchOrganizations() {
    const safeQuery = query.trim();

    if (safeQuery.length < 2) {
      setSearchMessage("Digite pelo menos 2 caracteres para buscar.");
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);

    try {
      const response = await fetch("/api/organizations/search?q=" + encodeURIComponent(safeQuery), {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok: boolean;
        organizations?: OrganizationSearchResult[];
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setResults([]);
        setSearchMessage(payload.message ?? "Não foi possível buscar organizações.");
        return;
      }

      setResults(payload.organizations ?? []);

      if (!payload.organizations?.length) {
        setSearchMessage("Nenhuma organização encontrada. Você pode cadastrar uma nova.");
      }
    } catch {
      setResults([]);
      setSearchMessage("Não foi possível buscar organizações agora.");
    } finally {
      setIsSearching(false);
    }
  }

  if (accountScope === "internal") {
    return (
      <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
        <div>
          <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
            Time
          </p>
          <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
            Time / departamento
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            O time define quais dashboards, relatórios e ações aparecem no painel.
          </p>
        </div>

        <OptionList
          label="Selecione seu time"
          description="Escolha o núcleo mais próximo da sua atuação principal."
          items={teams}
          value={internalTeam}
          onChange={(value) => form.setValue("internalTeam", value as never, { shouldDirty: true })}
          columns={3}
        />
      </section>
    );
  }

  if (isPersonalExternal) {
    return (
      <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
        <div>
          <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
            Conta pessoal
          </p>
          <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
            Sem vínculo institucional.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Você seguirá como usuário comum do ecossistema. Não é necessário buscar ou cadastrar empresa.
          </p>
        </div>

        <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Fluxo simplificado ativado</p>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                A próxima etapa será seu perfil pessoal, foco Flora, foto/capa/bio e resumo.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Organização
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          Encontre ou cadastre a organização.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Primeiro buscamos por nome ou CNPJ. Se a organização já existir, informe o código de acesso
          ou solicite associação. Se não existir, abra o cadastro da nova organização.
        </p>
      </div>

      <OptionList
        label="Qual é seu vínculo?"
        items={organizationRelations.map((item) => ({
          value: item.value,
          label: item.label,
          description: item.description,
        }))}
        value={organizationRelation}
        onChange={(value) => form.setValue("organizationRelation", value as never, { shouldDirty: true })}
        columns={2}
      />

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            label="Buscar por nome ou CNPJ"
            placeholder="Nome da empresa ou 00.000.000/0000-00"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="flex items-end">
            <Button type="button" onClick={searchOrganizations} disabled={isSearching}>
              <Search className="size-4" aria-hidden="true" />
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        {searchMessage ? (
          <p className="mt-3 text-sm leading-6 text-foreground-muted">{searchMessage}</p>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-5 space-y-3">
            {results.map((organization) => {
              const selected = organizationId === organization.id;

              return (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    form.setValue("organizationFlow", "existing", { shouldDirty: true });
                    form.setValue("organizationId", organization.id, { shouldDirty: true });
                    form.setValue("organizationName", organization.legalName, { shouldDirty: true });
                    form.setValue("organizationCnpj", organization.cnpj ?? "", { shouldDirty: true });
                  }}
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition hover:border-accent",
                    selected ? "border-accent bg-accent/10" : "border-border bg-surface",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 size-5 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">{organization.legalName}</p>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {organization.cnpj ? formatCnpj(organization.cnpj) : "CNPJ não informado"} ·{" "}
                        {organization.verificationStatus ?? "pendente"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("organizationFlow", "create", { shouldDirty: true });
              setIsCreateOpen(true);
            }}
          >
            Cadastrar nova organização
          </Button>
        </div>
      </div>

      {organizationId ? (
        <div className="rounded-2xl border border-border bg-background p-5">
          <Input
            label="Código de acesso da organização"
            placeholder="Informe o código fornecido pelo dono da organização"
            type="password"
            autoComplete="off"
            helperText="Se você não tiver código, a associação ficará pendente de aprovação."
            {...form.register("organizationAccessCode")}
          />
        </div>
      ) : null}

      {organizationRelation === "employee" && form.watch("organizationFlow") === "create" ? (
        <div className="rounded-2xl border border-emotion/30 bg-emotion/10 p-5 text-sm leading-6 text-foreground-secondary">
          Entraremos em contato para confirmar as informações.
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[9100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-irisLg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
                  Nova organização
                </p>
                <h3 className="mt-2 text-h3 font-semibold tracking-[-0.04em] text-foreground">
                  Cadastro institucional
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-border p-2 text-foreground-muted hover:text-foreground"
                aria-label="Fechar popup"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                label="Nome da organização"
                placeholder="IRÍS Social"
                value={organizationName ?? ""}
                onChange={(event) => {
                  form.setValue("organizationFlow", "create", { shouldDirty: true });
                  form.setValue("organizationName", event.target.value, { shouldDirty: true });
                }}
              />

              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={organizationCnpj ?? ""}
                onChange={(event) => {
                  form.setValue("organizationCnpj", formatCnpj(event.target.value), { shouldDirty: true });
                }}
              />

              <Select
                label="Segmento"
                options={organizationSegments.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                {...form.register("organizationSegment")}
              />

              <Input
                label="CNPJ limpo"
                value={onlyDigits(organizationCnpj)}
                readOnly
                helperText="Este valor é usado apenas para busca/validação técnica."
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  form.setValue("organizationFlow", "create", { shouldDirty: true });
                  setIsCreateOpen(false);
                }}
              >
                Usar estes dados
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
`);

write("src/components/onboarding/steps/step-notifications-or-contact.tsx", String.raw`
// web/src/components/onboarding/steps/step-notifications-or-contact.tsx
import type { OnboardingStepProps } from "@/components/onboarding/types";
import {
  businessPositions,
  notificationChannels,
  notificationFrequencies,
  notificationTopics,
} from "@/constants/onboarding";
import { Input } from "@/components/ui/input";
import { OptionList } from "@/components/ui/option-list";
import { Select } from "@/components/ui/select";

export function StepNotificationsOrContact({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const selectedChannels = form.watch("notificationChannels");
  const selectedTopics = form.watch("notificationTopics");
  const businessPosition = form.watch("businessPosition");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Contato
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          {accountScope === "internal" ? "Preferências de notificação" : "Contato e papel"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {accountScope === "internal"
            ? "Ajuste o que merece sua atenção. O objetivo é reduzir ruído."
            : "Nada de campo livre para cargo: selecione o papel mais próximo da sua atuação."}
        </p>
      </div>

      {accountScope === "internal" ? (
        <div className="space-y-6">
          <OptionList
            label="Canais"
            description="Escolha por onde quer receber atividades administrativas."
            items={notificationChannels.map((channel) => ({
              value: channel.value,
              label: channel.label,
              description: channel.description,
            }))}
            value={selectedChannels}
            multiple
            columns={4}
            onChange={(value) => form.setValue("notificationChannels", value as string[], { shouldDirty: true })}
          />

          <Select
            label="Frequência"
            options={notificationFrequencies.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            {...form.register("notificationFrequency")}
          />

          <OptionList
            label="Assuntos"
            description="Cada assunto controla um tipo de evento no admin."
            items={notificationTopics.map((topic) => ({
              value: topic.value,
              label: topic.label,
              description: topic.description,
            }))}
            value={selectedTopics}
            multiple
            columns={4}
            onChange={(value) => form.setValue("notificationTopics", value as string[], { shouldDirty: true })}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Input label="Telefone comercial" placeholder="(00) 00000-0000" {...form.register("businessPhone")} />

          <OptionList
            label="Seu papel na organização"
            description="Selecione a alternativa mais próxima. Isso ajuda na validação e nas permissões."
            items={businessPositions.map((position) => ({
              value: position.value,
              label: position.label,
              description: position.description,
            }))}
            value={businessPosition}
            onChange={(value) => form.setValue("businessPosition", value as never, { shouldDirty: true })}
            columns={3}
          />
        </div>
      )}
    </section>
  );
}
`);

write("src/components/onboarding/steps/step-profile-assets.tsx", String.raw`
// web/src/components/onboarding/steps/step-profile-assets.tsx
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OnboardingStepProps } from "@/components/onboarding/types";

export type ProfileAssetDraft = {
  avatarFile: File | null;
  coverFile: File | null;
};

type StepProfileAssetsProps = Pick<OnboardingStepProps, "form"> & {
  profileAssets: ProfileAssetDraft;
  setProfileAssets: Dispatch<SetStateAction<ProfileAssetDraft>>;
};

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export function StepProfileAssets({
  form,
  profileAssets,
  setProfileAssets,
}: StepProfileAssetsProps) {
  const avatarPreview = useObjectUrl(profileAssets.avatarFile);
  const coverPreview = useObjectUrl(profileAssets.coverFile);

  const avatarTransform = form.watch("avatarTransform") ?? { cropX: 0, cropY: 0, zoom: 1 };
  const coverTransform = form.watch("coverTransform") ?? { cropX: 0, cropY: 0, zoom: 1 };

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Perfil visual
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Foto, capa e bio.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Tudo aqui é opcional. A imagem será enviada apenas no final da criação da conta.
        </p>
      </div>

      <Input
        label="Bio curta"
        placeholder="Uma descrição breve, elegante e humana."
        maxLength={280}
        helperText="Até 280 caracteres."
        {...form.register("profileBio")}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-irisSm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Foto de perfil</p>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                PNG, JPG ou WEBP. Máximo 5MB.
              </p>
            </div>
            <ImagePlus className="size-5 text-accent" aria-hidden="true" />
          </div>

          <label className="mt-4 flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background text-center transition hover:border-accent">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Prévia da foto de perfil"
                className="size-32 rounded-full object-cover"
                style={{
                  transform:
                    "translate(" +
                    avatarTransform.cropX +
                    "px, " +
                    avatarTransform.cropY +
                    "px) scale(" +
                    avatarTransform.zoom +
                    ")",
                }}
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-foreground-muted">
                <Upload className="size-5" aria-hidden="true" />
                Selecionar foto
              </span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProfileAssets((current) => ({ ...current, avatarFile: file }));
              }}
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-foreground-muted">
            Zoom da foto
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={avatarTransform.zoom}
              onChange={(event) => {
                form.setValue(
                  "avatarTransform",
                  {
                    ...avatarTransform,
                    zoom: Number(event.target.value),
                  },
                  { shouldDirty: true },
                );
              }}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-irisSm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Capa</p>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Imagem horizontal para presença visual.
              </p>
            </div>
            <ImagePlus className="size-5 text-emotion" aria-hidden="true" />
          </div>

          <label className="mt-4 flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background text-center transition hover:border-accent">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Prévia da capa"
                className="h-36 w-full rounded-xl object-cover"
                style={{
                  transform:
                    "translate(" +
                    coverTransform.cropX +
                    "px, " +
                    coverTransform.cropY +
                    "px) scale(" +
                    coverTransform.zoom +
                    ")",
                }}
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-foreground-muted">
                <Upload className="size-5" aria-hidden="true" />
                Selecionar capa
              </span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProfileAssets((current) => ({ ...current, coverFile: file }));
              }}
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-foreground-muted">
            Zoom da capa
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={coverTransform.zoom}
              onChange={(event) => {
                form.setValue(
                  "coverTransform",
                  {
                    ...coverTransform,
                    zoom: Number(event.target.value),
                  },
                  { shouldDirty: true },
                );
              }}
              className="mt-2 w-full"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
`);

write("src/components/onboarding/onboarding-wizard.tsx", String.raw`
// web/src/components/onboarding/onboarding-wizard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepAccountKind } from "@/components/onboarding/steps/step-account-kind";
import { StepAccountSummary } from "@/components/onboarding/steps/step-account-summary";
import { StepBotanicIdentity } from "@/components/onboarding/steps/step-botanic-identity";
import { StepEmail } from "@/components/onboarding/steps/step-email";
import { StepInternalCreationKey } from "@/components/onboarding/steps/step-internal-creation-key";
import {
  StepProfileAssets,
  type ProfileAssetDraft,
} from "@/components/onboarding/steps/step-profile-assets";
import { StepNotificationsOrContact } from "@/components/onboarding/steps/step-notifications-or-contact";
import { StepTeamOrOrganization } from "@/components/onboarding/steps/step-team-or-organization";
import { StepTour } from "@/components/onboarding/steps/step-tour";
import { StepUserProfile } from "@/components/onboarding/steps/step-user-profile";
import type { UsernameStatus } from "@/components/onboarding/types";
import {
  getAccountScopeFromEmail,
  getPasswordChecks,
  normalizeUsername,
} from "@/components/onboarding/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { REGISTER_ERRORS, getIrisUserMessage, logIrisError } from "@/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/schemas/onboarding.schema";

type OnboardingStepId =
  | "email"
  | "kind"
  | "internal-key"
  | "affiliation"
  | "communication"
  | "profile"
  | "flora"
  | "assets"
  | "summary"
  | "tour";

type StepDescriptor = {
  id: OnboardingStepId;
  label: string;
};

const defaultValues: OnboardingFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  accountScope: "external",
  internalRole: undefined,
  internalTeam: undefined,
  hasInternalCreationKey: false,
  internalCreationKey: "",
  externalAccountType: undefined,
  organizationFlow: "none",
  organizationId: undefined,
  organizationName: "",
  organizationCnpj: "",
  organizationSegment: undefined,
  organizationRelation: undefined,
  organizationAccessCode: "",
  businessPhone: "",
  businessPosition: undefined,
  notificationChannels: ["internal_email"],
  notificationFrequency: "daily_digest",
  notificationTopics: ["new_requests", "pending_approvals"],
  fullName: "",
  username: "",
  cpf: "",
  birthDate: "",
  cep: "",
  addressLine: "",
  addressNumber: "",
  addressComplement: "",
  neighborhood: "",
  city: "",
  state: "",
  botanicInclination: "NULO",
  profileBio: "",
  avatarPath: "",
  coverPath: "",
  avatarTransform: { cropX: 0, cropY: 0, zoom: 1 },
  coverTransform: { cropX: 0, cropY: 0, zoom: 1 },
  acceptedTerms: false,
  acceptedPartnerTerms: false,
  allowTour: true,
};

function removeSensitiveDraftFields(values: OnboardingFormValues) {
  return {
    ...values,
    password: "",
    confirmPassword: "",
    cpf: "",
    internalCreationKey: "",
    organizationAccessCode: "",
    avatarPath: "",
    coverPath: "",
  };
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadProfileAsset(params: {
  userId: string;
  file: File | null;
  kind: "avatar" | "cover";
}) {
  const { userId, file, kind } = params;

  if (!file) return "";

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Formato de imagem não permitido.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Imagem maior que o limite de 5MB.");
  }

  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase não configurado para upload.");
  }

  const extension = getFileExtension(file);
  const assetPath = "users/" + userId + "/profile/" + kind + "." + extension;

  const { error } = await supabase.storage
    .from("iris-profile-assets")
    .upload(assetPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return assetPath;
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    state: "idle",
    message: "Escolha um @ único para o admin.",
  });
  const [completed, setCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState<string | null>(null);
  const [profileAssets, setProfileAssets] = useState<ProfileAssetDraft>({
    avatarFile: null,
    coverFile: null,
  });

  const form = useForm<OnboardingFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const email = form.watch("email");
  const accountScope = form.watch("accountScope");
  const username = form.watch("username");
  const externalAccountType = form.watch("externalAccountType");

  const isPersonalExternal = accountScope === "external" && externalAccountType === "final_customer";

  const steps = useMemo<StepDescriptor[]>(() => {
    const sharedStart: StepDescriptor[] = [
      { id: "email", label: "E-mail" },
      { id: "kind", label: accountScope === "internal" ? "Função" : "Tipo" },
    ];

    const middle: StepDescriptor[] =
      accountScope === "internal"
        ? [
            { id: "internal-key", label: "Chave" },
            { id: "affiliation", label: "Time" },
            { id: "communication", label: "Avisos" },
          ]
        : isPersonalExternal
          ? []
          : [
              { id: "affiliation", label: "Organização" },
              { id: "communication", label: "Contato" },
            ];

    return [
      ...sharedStart,
      ...middle,
      { id: "profile", label: "Usuário" },
      { id: "flora", label: "Flora" },
      { id: "assets", label: "Perfil" },
      { id: "summary", label: "Resumo" },
      { id: "tour", label: "Tour" },
    ];
  }, [accountScope, isPersonalExternal]);

  const activeStep = steps[currentStep]?.id ?? "email";

  useEffect(() => {
    setCurrentStep((step) => Math.min(step, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    const scope = getAccountScopeFromEmail(email);
    form.setValue("accountScope", scope);

    if (scope === "internal") {
      form.setValue("externalAccountType", undefined);
    } else {
      form.setValue("internalRole", undefined);
      form.setValue("internalTeam", undefined);
      form.setValue("hasInternalCreationKey", false);
      form.setValue("internalCreationKey", "");
    }
  }, [email, form]);

  useEffect(() => {
    if (isPersonalExternal) {
      form.setValue("organizationFlow", "none");
      form.setValue("organizationId", undefined);
      form.setValue("organizationName", "");
      form.setValue("organizationCnpj", "");
      form.setValue("organizationRelation", undefined);
      form.setValue("organizationAccessCode", "");
      form.setValue("businessPosition", undefined);
      form.setValue("acceptedPartnerTerms", false);
    }
  }, [form, isPersonalExternal]);

  useEffect(() => {
    const rawDraft = window.localStorage.getItem("iris-admin-onboarding-draft");

    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Partial<OnboardingFormValues> & {
        currentStep?: number;
      };

      Object.entries(draft).forEach(([key, value]) => {
        if (key === "currentStep") return;
        if (key === "password" || key === "confirmPassword" || key === "cpf") return;
        if (key === "internalCreationKey" || key === "organizationAccessCode") return;
        if (key === "avatarPath" || key === "coverPath") return;

        form.setValue(key as keyof OnboardingFormValues, value as never);
      });

      if (typeof draft.currentStep === "number") {
        setCurrentStep(Math.min(Math.max(draft.currentStep, 0), steps.length - 1));
      }
    } catch {
      window.localStorage.removeItem("iris-admin-onboarding-draft");
    }
  }, [form, steps.length]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      window.localStorage.setItem(
        "iris-admin-onboarding-draft",
        JSON.stringify({
          ...removeSensitiveDraftFields(values as OnboardingFormValues),
          currentStep,
        }),
      );
    });

    return () => subscription.unsubscribe();
  }, [form, currentStep]);

  useEffect(() => {
    const normalized = normalizeUsername(username);

    if (username !== normalized) {
      form.setValue("username", normalized);
      return;
    }

    if (normalized.length < 3) {
      setUsernameStatus({
        state: "idle",
        message: "Escolha um @ único para o admin.",
      });
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setUsernameStatus({
          state: "checking",
          message: "Verificando disponibilidade...",
        });

        const response = await fetch(
          "/api/onboarding/username/check?username=" + encodeURIComponent(normalized),
          { cache: "no-store" },
        );

        const payload = (await response.json()) as {
          available: boolean;
          checked: boolean;
          reason: string;
        };

        if (!payload.checked) {
          setUsernameStatus({
            state: "unknown",
            message: payload.reason,
          });
          return;
        }

        setUsernameStatus({
          state: payload.available ? "available" : "unavailable",
          message: payload.reason,
        });
      } catch (error) {
        const irisError = REGISTER_ERRORS.REGISTER_USERNAME_CHECK_FAILED;
        logIrisError(irisError, { route: "/register", action: "username_check" }, error);
        setUsernameStatus({
          state: "unknown",
          message: getIrisUserMessage(irisError),
        });
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [username, form]);

  function canGoNext(): boolean {
    const values = form.getValues();

    if (activeStep === "email") {
      const passwordChecks = getPasswordChecks(values.password, values.confirmPassword);
      return values.email.includes("@") && passwordChecks.every((check) => check.valid);
    }

    if (activeStep === "kind") {
      return accountScope === "internal"
        ? Boolean(values.internalRole)
        : Boolean(values.externalAccountType);
    }

    if (activeStep === "internal-key") {
      return !values.hasInternalCreationKey || Boolean(values.internalCreationKey?.trim());
    }

    if (activeStep === "affiliation") {
      if (accountScope === "internal") return Boolean(values.internalTeam);
      if (values.externalAccountType === "final_customer") return true;

      if (values.organizationFlow === "existing") return Boolean(values.organizationId);
      if (values.organizationFlow === "create") {
        return Boolean(values.organizationName?.trim()) && Boolean(values.organizationRelation);
      }

      return false;
    }

    if (activeStep === "communication") {
      return accountScope === "internal"
        ? values.notificationChannels.length > 0 && values.notificationTopics.length > 0
        : Boolean(values.businessPosition);
    }

    if (activeStep === "profile") {
      return (
        values.fullName.trim().length >= 3 &&
        values.username.trim().length >= 3 &&
        values.acceptedTerms &&
        (isPersonalExternal || accountScope === "internal" || Boolean(values.acceptedPartnerTerms))
      );
    }

    if (activeStep === "flora") {
      return Boolean(values.botanicInclination);
    }

    return true;
  }

  function goNext() {
    setFormError(null);

    if (!canGoNext()) {
      setFormError("Preencha os campos obrigatórios desta etapa antes de continuar.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setFormError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function onSubmit(values: OnboardingFormValues) {
    setFormError(null);
    setSuccessMessage(null);
    setDiagnosticCode(null);

    const parsed = onboardingSchema.safeParse(values);

    if (!parsed.success) {
      const irisError = REGISTER_ERRORS.REGISTER_SCHEMA_REFINEMENT_FAILURE;
      logIrisError(
        irisError,
        { route: "/register", action: "zod_validation", metadata: parsed.error.flatten() },
      );
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    if (usernameStatus.state === "unavailable") {
      const irisError = REGISTER_ERRORS.REGISTER_USERNAME_UNAVAILABLE;
      logIrisError(irisError, { route: "/register", action: "username_unavailable" });
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const supabase = createSupabaseBrowserClient({ persistSession: true });

    if (!supabase) {
      const irisError = REGISTER_ERRORS.REGISTER_SUPABASE_NOT_CONFIGURED;
      logIrisError(irisError, { route: "/register", action: "create_supabase_browser_client" });
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      const irisError = REGISTER_ERRORS.REGISTER_SIGNUP_FAILED;
      logIrisError(
        irisError,
        { route: "/register", action: "auth_sign_up", email: parsed.data.email },
        error,
      );
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const session = data.session ?? (await supabase.auth.getSession()).data.session;

    if (!session?.access_token) {
      const irisError = REGISTER_ERRORS.REGISTER_SESSION_MISSING_AFTER_SIGNUP;
      logIrisError(irisError, { route: "/register", action: "signup_without_session" });
      setCompleted(true);
      setSuccessMessage(getIrisUserMessage(irisError));
      window.localStorage.removeItem("iris-admin-onboarding-draft");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? data.user?.id;

    if (!userId) {
      setFormError("Não foi possível confirmar o usuário autenticado para concluir o cadastro.");
      return;
    }

    try {
      const [avatarPath, coverPath] = await Promise.all([
        uploadProfileAsset({
          userId,
          file: profileAssets.avatarFile,
          kind: "avatar",
        }),
        uploadProfileAsset({
          userId,
          file: profileAssets.coverFile,
          kind: "cover",
        }),
      ]);

      const { password: _password, confirmPassword: _confirmPassword, ...payload } = {
        ...parsed.data,
        avatarPath,
        coverPath,
      };

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        redirectTo?: string;
        diagnosticCode?: string;
      };

      if (!response.ok || !result.ok) {
        const irisError = REGISTER_ERRORS.REGISTER_COMPLETE_API_FAILED;
        logIrisError(
          irisError,
          {
            route: "/register",
            action: "complete_onboarding",
            metadata: { status: response.status, message: result.message },
          },
        );
        setFormError(result.message ?? getIrisUserMessage(irisError));
        return;
      }

      window.localStorage.removeItem("iris-admin-onboarding-draft");
      setCompleted(true);
      setDiagnosticCode(result.diagnosticCode ?? null);
      setSuccessMessage("Cadastro concluído. Seu acesso foi criado com Botanic Identity.");
    } catch (error) {
      const irisError = REGISTER_ERRORS.REGISTER_COMPLETE_API_FAILED;
      logIrisError(irisError, { route: "/register", action: "profile_assets_or_complete" }, error);
      setFormError("Não foi possível concluir o cadastro com os dados visuais do perfil.");
    }
  }

  if (completed) {
    return (
      <div className="animate-[iris-soft-enter_360ms_ease-out] rounded-2xl border border-success/30 bg-success/10 p-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>

        <h2 className="mt-5 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Acesso criado
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {successMessage}
        </p>

        {diagnosticCode ? (
          <div className="mt-5 rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
              Identificador de suporte
            </p>
            <p className="mt-2 break-all text-sm font-medium text-foreground">
              {diagnosticCode}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/login">Ir para login</ButtonLink>
          <ButtonLink href="/" variant="outline">Voltar ao início</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <StepIndicator steps={steps.map((step) => step.label)} currentStep={currentStep} />

      {formError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
          {formError}
        </div>
      ) : null}

      {activeStep === "email" ? <StepEmail form={form} /> : null}
      {activeStep === "kind" ? <StepAccountKind form={form} /> : null}
      {activeStep === "internal-key" ? <StepInternalCreationKey form={form} /> : null}
      {activeStep === "affiliation" ? <StepTeamOrOrganization form={form} /> : null}
      {activeStep === "communication" ? <StepNotificationsOrContact form={form} /> : null}
      {activeStep === "profile" ? (
        <StepUserProfile
          form={form}
          usernameStatus={usernameStatus}
          setUsernameStatus={setUsernameStatus}
        />
      ) : null}
      {activeStep === "flora" ? <StepBotanicIdentity form={form} /> : null}
      {activeStep === "assets" ? (
        <StepProfileAssets
          form={form}
          profileAssets={profileAssets}
          setProfileAssets={setProfileAssets}
        />
      ) : null}
      {activeStep === "summary" ? <StepAccountSummary form={form} /> : null}
      {activeStep === "tour" ? <StepTour form={form} /> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0 || form.formState.isSubmitting}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Continuar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Criando acesso...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden="true" />
                Concluir onboarding
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-center text-xs leading-5 text-foreground-muted">
        O fluxo não redireciona automaticamente após criar a conta.
      </p>
    </form>
  );
}
`);

write("src/app/api/organizations/search/route.ts", String.raw`
// web/src/app/api/organizations/search/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const digits = onlyDigits(query);

  if (query.length < 2) {
    return NextResponse.json(
      { ok: false, message: "Digite pelo menos 2 caracteres." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase server-side não configurado." },
      { status: 500 },
    );
  }

  let requestBuilder = supabase
    .from("admin_organizations")
    .select("id, legal_name, cnpj, segment, verification_status")
    .limit(8);

  if (digits.length >= 8) {
    requestBuilder = requestBuilder.or(
      "legal_name.ilike.%" + query + "%,cnpj.eq." + digits,
    );
  } else {
    requestBuilder = requestBuilder.ilike("legal_name", "%" + query + "%");
  }

  const { data, error } = await requestBuilder;

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível buscar organizações." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    organizations: (data ?? []).map((organization) => ({
      id: organization.id,
      legalName: organization.legal_name,
      cnpj: organization.cnpj,
      segment: organization.segment,
      verificationStatus: organization.verification_status,
    })),
  });
}
`);

write("src/lib/botanic/server.ts", String.raw`
// web/src/lib/botanic/server.ts
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingServerPayload } from "@/schemas/onboarding.schema";

type ResolveInitialBotanicIdentityParams = {
  supabase: SupabaseClient;
  payload: OnboardingServerPayload;
  userId: string;
  email: string;
};

type InternalCreationKeyRow = {
  id: string;
  allowed_species_code: string;
  allowed_stage_code: string;
  allowed_inclination_code: string | null;
  allowed_governance_role_code: string | null;
  allowed_email_domain: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
};

type ResolvedIdentity = {
  speciesCode: string;
  stageCode: string;
  inclinationCode: string;
  governanceRoleCode: string | null;
  rootGovernanceEnabled: boolean;
  assignmentSource: string;
  assignedReason: string;
  metadata: Record<string, unknown>;
};

type ResolveInitialBotanicIdentityResult =
  | {
      ok: true;
      identity: ResolvedIdentity;
      internalCreationKeyId: string | null;
      nextInternalCreationKeyUsage: number | null;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

function hashInternalCreationKey(value: string) {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

function getDefaultExternalIdentity(payload: OnboardingServerPayload): ResolvedIdentity {
  if (payload.externalAccountType === "final_customer") {
    return {
      speciesCode: "LOTUS",
      stageCode: "BROTO",
      inclinationCode: payload.botanicInclination || "NULO",
      governanceRoleCode: null,
      rootGovernanceEnabled: false,
      assignmentSource: "onboarding_personal_user",
      assignedReason: "Conta comum do ecossistema criada sem vínculo institucional.",
      metadata: {
        externalAccountType: payload.externalAccountType,
      },
    };
  }

  return {
    speciesCode: "ORQUIDEA",
    stageCode: "BROTO",
    inclinationCode: payload.botanicInclination || "NULO",
    governanceRoleCode: null,
    rootGovernanceEnabled: false,
    assignmentSource: "onboarding_institutional_external",
    assignedReason: "Conta externa institucional inicial.",
    metadata: {
      externalAccountType: payload.externalAccountType,
      organizationFlow: payload.organizationFlow,
      organizationRelation: payload.organizationRelation,
    },
  };
}

function getDefaultInternalIdentity(payload: OnboardingServerPayload): ResolvedIdentity {
  return {
    speciesCode: "TULIPA",
    stageCode: "BROTO",
    inclinationCode: payload.botanicInclination || "NULO",
    governanceRoleCode: payload.internalRole === "dev" ? "staff_engineering" : "staff_curator",
    rootGovernanceEnabled: false,
    assignmentSource: "onboarding_internal_without_creation_key",
    assignedReason: "Conta interna criada sem chave de criação elevada.",
    metadata: {
      internalRole: payload.internalRole,
      internalTeam: payload.internalTeam,
    },
  };
}

async function getInternalCreationKey(
  supabase: SupabaseClient,
  keyValue: string,
): Promise<InternalCreationKeyRow | null> {
  const keyHash = hashInternalCreationKey(keyValue);

  const { data, error } = await supabase
    .from("botanic_internal_creation_keys")
    .select(
      [
        "id",
        "allowed_species_code",
        "allowed_stage_code",
        "allowed_inclination_code",
        "allowed_governance_role_code",
        "allowed_email_domain",
        "max_uses",
        "used_count",
        "expires_at",
        "is_active",
        "metadata",
      ].join(","),
    )
    .eq("key_hash", keyHash)
    .maybeSingle<InternalCreationKeyRow>();

  if (error || !data) {
    return null;
  }

  return data;
}

function isCreationKeyUsable(params: {
  row: InternalCreationKeyRow;
  email: string;
}) {
  const { row, email } = params;

  if (!row.is_active) return false;

  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return false;
  }

  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return false;
  }

  if (row.allowed_email_domain) {
    return getEmailDomain(email) === row.allowed_email_domain;
  }

  return true;
}

export async function resolveInitialBotanicIdentity(
  params: ResolveInitialBotanicIdentityParams,
): Promise<ResolveInitialBotanicIdentityResult> {
  const { supabase, payload, email } = params;

  if (payload.accountScope === "external") {
    return {
      ok: true,
      identity: getDefaultExternalIdentity(payload),
      internalCreationKeyId: null,
      nextInternalCreationKeyUsage: null,
    };
  }

  if (!payload.hasInternalCreationKey || !payload.internalCreationKey?.trim()) {
    return {
      ok: true,
      identity: getDefaultInternalIdentity(payload),
      internalCreationKeyId: null,
      nextInternalCreationKeyUsage: null,
    };
  }

  const creationKey = await getInternalCreationKey(supabase, payload.internalCreationKey);

  if (!creationKey || !isCreationKeyUsable({ row: creationKey, email })) {
    return {
      ok: false,
      status: 403,
      message: "A chave de criação não pôde ser validada.",
    };
  }

  return {
    ok: true,
    identity: {
      speciesCode: creationKey.allowed_species_code,
      stageCode: creationKey.allowed_stage_code,
      inclinationCode: creationKey.allowed_inclination_code || payload.botanicInclination || "NULO",
      governanceRoleCode: creationKey.allowed_governance_role_code,
      rootGovernanceEnabled:
        creationKey.allowed_species_code === "IRIS" &&
        creationKey.allowed_stage_code === "BIOMA",
      assignmentSource: "internal_creation_key",
      assignedReason: "Identidade definida por chave interna de criação validada no servidor.",
      metadata: {
        ...creationKey.metadata,
        internalRole: payload.internalRole,
        internalTeam: payload.internalTeam,
      },
    },
    internalCreationKeyId: creationKey.id,
    nextInternalCreationKeyUsage: creationKey.used_count + 1,
  };
}
`);

write("src/app/api/onboarding/complete/route.ts", String.raw`
// web/src/app/api/onboarding/complete/route.ts
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { resolveInitialBotanicIdentity } from "@/lib/botanic/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";
import { onboardingServerPayloadSchema } from "@/schemas/onboarding.schema";

export const runtime = "nodejs";

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "");
}

function onlyDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeRegion(value: string | undefined): string {
  const normalized = (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized || "NA";
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

function hashCpf(cpf: string | undefined): { cpfLast4: string | null; cpfSha256: string | null } {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) {
    return { cpfLast4: null, cpfSha256: null };
  }

  return {
    cpfLast4: digits.slice(-4),
    cpfSha256: crypto.createHash("sha256").update(digits).digest("hex"),
  };
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

async function validateOrganizationAccessCode(params: {
  supabase: ReturnType<typeof createSupabaseServerAdminClient>;
  organizationId: string;
  code: string | undefined;
}) {
  const { supabase, organizationId, code } = params;

  if (!supabase || !code?.trim()) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  const codeHash = hashValue(code);

  const { data } = await supabase
    .from("admin_organization_access_codes")
    .select("id, role_label, max_uses, used_count, expires_at, is_active")
    .eq("organization_id", organizationId)
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (!data || !data.is_active) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  return {
    ok: true,
    roleLabel: data.role_label,
    codeId: data.id,
    nextUsedCount: data.used_count + 1,
  };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ ok: false, message: "Sessão ausente." }, { status: 401 });
  }

  const supabase = createSupabaseServerAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase server-side não configurado." },
      { status: 500 },
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  const rawBody = await request.json();
  const parsed = onboardingServerPayloadSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Dados do onboarding inválidos.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const userId = authData.user.id;
  const username = normalizeUsername(payload.username);
  const { cpfLast4, cpfSha256 } = hashCpf(payload.cpf);
  const regionCode = normalizeRegion(payload.state);
  const countryCode = "BRA";

  const botanicIdentityResolution = await resolveInitialBotanicIdentity({
    supabase,
    payload,
    userId,
    email: payload.email,
  });

  if (!botanicIdentityResolution.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: botanicIdentityResolution.message,
      },
      { status: botanicIdentityResolution.status },
    );
  }

  const { data: ecosystemProfile, error: ecosystemProfileError } = await supabase
    .from("ecosystem_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: payload.fullName,
        username,
        bio: payload.profileBio?.trim() || null,
        avatar_path: payload.avatarPath || null,
        cover_path: payload.coverPath || null,
        avatar_transform: payload.avatarTransform ?? {},
        cover_transform: payload.coverTransform ?? {},
        region_code: regionCode,
        country_code: countryCode,
        profile_status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (ecosystemProfileError || !ecosystemProfile) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar o perfil global." },
      { status: 500 },
    );
  }

  const { data: botanicIdentity, error: botanicIdentityError } = await supabase
    .from("botanic_identities")
    .upsert(
      {
        user_id: userId,
        profile_id: ecosystemProfile.id,
        species_code: botanicIdentityResolution.identity.speciesCode,
        stage_code: botanicIdentityResolution.identity.stageCode,
        inclination_code: botanicIdentityResolution.identity.inclinationCode,
        account_prefix: "IRS",
        region_code: regionCode,
        country_code: countryCode,
        governance_role_code: botanicIdentityResolution.identity.governanceRoleCode,
        root_governance_enabled: botanicIdentityResolution.identity.rootGovernanceEnabled,
        identity_status: "active",
        assignment_source: botanicIdentityResolution.identity.assignmentSource,
        assigned_reason: botanicIdentityResolution.identity.assignedReason,
        metadata: botanicIdentityResolution.identity.metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id, diagnostic_code")
    .single();

  if (botanicIdentityError || !botanicIdentity) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível criar a identidade botânica." },
      { status: 500 },
    );
  }

  if (botanicIdentityResolution.internalCreationKeyId) {
    await supabase
      .from("botanic_internal_creation_keys")
      .update({
        used_count: botanicIdentityResolution.nextInternalCreationKeyUsage,
      })
      .eq("id", botanicIdentityResolution.internalCreationKeyId);
  }

  const { error: profileError } = await supabase.from("admin_profiles").upsert(
    {
      user_id: userId,
      email: payload.email.toLowerCase(),
      full_name: payload.fullName,
      username,
      account_scope: payload.accountScope,
      internal_role: payload.accountScope === "internal" ? payload.internalRole : null,
      internal_team: payload.accountScope === "internal" ? payload.internalTeam : null,
      external_account_type:
        payload.accountScope === "external" ? payload.externalAccountType : null,
      onboarding_status: "completed",
      onboarding_step: 10,
      terms_accepted_at: payload.acceptedTerms ? new Date().toISOString() : null,
      partner_terms_accepted_at:
        payload.accountScope === "external" && payload.acceptedPartnerTerms
          ? new Date().toISOString()
          : null,
      botanic_identity_id: botanicIdentity.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar o perfil administrativo." },
      { status: 500 },
    );
  }

  const { error: personalError } = await supabase.from("admin_private_personal_details").upsert(
    {
      user_id: userId,
      cpf_last4: cpfLast4,
      cpf_sha256: cpfSha256,
      birth_date: payload.birthDate || null,
      cep: onlyDigits(payload.cep) || null,
      address_payload: {
        addressLine: payload.addressLine || null,
        addressNumber: payload.addressNumber || null,
        addressComplement: payload.addressComplement || null,
        neighborhood: payload.neighborhood || null,
        city: payload.city || null,
        state: payload.state || null,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (personalError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar os dados privados." },
      { status: 500 },
    );
  }

  const { error: preferencesError } = await supabase
    .from("admin_notification_preferences")
    .upsert(
      {
        user_id: userId,
        channels: payload.notificationChannels,
        frequency: payload.notificationFrequency,
        topics: payload.notificationTopics,
        tour_enabled: payload.allowTour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (preferencesError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar preferências." },
      { status: 500 },
    );
  }

  const isInstitutionalExternal =
    payload.accountScope === "external" && payload.externalAccountType !== "final_customer";

  if (isInstitutionalExternal) {
    if (payload.organizationFlow === "existing" && payload.organizationId) {
      const accessValidation = await validateOrganizationAccessCode({
        supabase,
        organizationId: payload.organizationId,
        code: payload.organizationAccessCode,
      });

      if (accessValidation.ok) {
        await supabase.from("admin_organization_members").upsert(
          {
            organization_id: payload.organizationId,
            user_id: userId,
            role_label: payload.businessPosition || accessValidation.roleLabel || "member",
            business_phone: payload.businessPhone || null,
          },
          { onConflict: "organization_id,user_id" },
        );

        if (accessValidation.codeId && accessValidation.nextUsedCount !== null) {
          await supabase
            .from("admin_organization_access_codes")
            .update({ used_count: accessValidation.nextUsedCount })
            .eq("id", accessValidation.codeId);
        }
      } else {
        await supabase.from("admin_organization_join_requests").insert({
          organization_id: payload.organizationId,
          requester_user_id: userId,
          requester_email: payload.email.toLowerCase(),
          relation_type: payload.organizationRelation || "employee",
          requested_role: payload.businessPosition || null,
          organization_name_snapshot: payload.organizationName || null,
          organization_cnpj_snapshot: onlyDigits(payload.organizationCnpj) || null,
          status: "pending",
          message: "Associação solicitada sem código válido de organização.",
        });
      }
    }

    if (payload.organizationFlow === "create") {
      if (payload.organizationRelation === "owner") {
        const { data: organization, error: organizationError } = await supabase
          .from("admin_organizations")
          .insert({
            legal_name: payload.organizationName,
            normalized_legal_name: payload.organizationName?.trim().toLowerCase() || null,
            cnpj: onlyDigits(payload.organizationCnpj) || null,
            segment: payload.organizationSegment || null,
            owner_user_id: userId,
            created_by: userId,
            verification_status: "pending",
          })
          .select("id")
          .single();

        if (organizationError || !organization) {
          return NextResponse.json(
            { ok: false, message: "Não foi possível criar a organização." },
            { status: 500 },
          );
        }

        await supabase.from("admin_organization_members").insert({
          organization_id: organization.id,
          user_id: userId,
          role_label: payload.businessPosition || "owner",
          business_phone: payload.businessPhone || null,
        });
      } else {
        await supabase.from("admin_organization_join_requests").insert({
          requester_user_id: userId,
          requester_email: payload.email.toLowerCase(),
          relation_type: "employee",
          requested_role: payload.businessPosition || null,
          organization_name_snapshot: payload.organizationName || null,
          organization_cnpj_snapshot: onlyDigits(payload.organizationCnpj) || null,
          status: "contact_required",
          message: "Entraremos em contato para confirmar as informações.",
        });
      }
    }
  }

  await supabase.from("admin_onboarding_drafts").delete().eq("user_id", userId);

  return NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
    diagnosticCode: botanicIdentity.diagnostic_code,
  });
}
`);

console.log("");
console.log("Setup onboarding v2 aplicado em:", webRoot);
console.log("");

try {
  childProcess.execSync("npm run typecheck", {
    cwd: webRoot,
    stdio: "inherit",
    shell: true,
  });
  console.log("");
  console.log("OK: typecheck passou.");
} catch (error) {
  console.error("");
  console.error("ERRO: typecheck falhou. Copie a saída acima e envie aqui.");
  process.exit(error.status || 1);
}
