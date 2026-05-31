#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const childProcess = require("child_process");

const cwd = process.cwd();

function exists(filePath) {
  return fs.existsSync(filePath);
}

let webRoot = null;

if (exists(path.join(cwd, "package.json")) && exists(path.join(cwd, "src"))) {
  webRoot = cwd;
} else if (exists(path.join(cwd, "web", "package.json"))) {
  webRoot = path.join(cwd, "web");
} else {
  console.error("ERRO: não encontrei package.json do app.");
  console.error("Rode este setup em /c/iris ou /c/iris/web.");
  process.exit(1);
}

function write(relativePath, content) {
  const filePath = path.join(webRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
  console.log("OK:", relativePath);
}

function removeNestedDuplicatedWeb() {
  const nestedWeb = path.join(webRoot, "web");

  if (!exists(nestedWeb)) return;

  const backupPath = path.join(os.tmpdir(), "iris-nested-web-backup-" + Date.now());

  try {
    fs.renameSync(nestedWeb, backupPath);
    console.log("OK: pasta duplicada web/web movida para:", backupPath);
  } catch (error) {
    console.warn("AVISO: não consegui mover web/web. Tentando remover direto.");
    console.warn(error.message);
    fs.rmSync(nestedWeb, { recursive: true, force: true });
    console.log("OK: pasta duplicada web/web removida.");
  }
}

removeNestedDuplicatedWeb();

write("docs/architecture/BOTANIC_IDENTITY_FLORA.md", String.raw`
# IRÍS — Botanic Identity / Motor Flora

O Motor Flora é a camada global de identidade, permissão e roteamento cognitivo do ecossistema IRÍS.

A taxonomia botânica é interna ao sistema, banco, APIs, JWT e moderação. A interface final deve traduzir essa estrutura para nomes humanos e simples.

## Assinatura Flora

Formato oficial:

[ESPECIE]-[ESTAGIO]-[INCLINACAO]-[ACCOUNT_PREFIX]/[ACCOUNT_NUMBER]-[REGION]/[COUNTRY]

Exemplo:

LOTUS-FLORESCENCIA-SIMBIOTICA-IRS/000001-SP/BRA

## Códigos iniciais

Espécies: IRIS, TULIPA, ORQUIDEA, LOTUS, DENTEDELEAO.

Estágios: DORMENTE, BROTO, FLORESCENCIA, BIOMA.

Inclinações: NULO, INTROSPECTIVA, SIMBIOTICA, CULTURAL.

## Decisões técnicas

- Botanic Identity é global, não apenas Admin.
- Não usamos enum rígido como estrutura principal.
- Usamos tabelas de referência para permitir expansão futura.
- IRIS é a espécie fundadora sob Root Governance.
- IRIS-BIOMA-NULO representa poder supremo, mas nunca quebra Zero-Knowledge/E2EE.
- Chaves internas de criação são hashadas, auditadas e validadas apenas no servidor.
- Foto de perfil e capa usam o bucket iris-profile-assets.
`);

write("src/schemas/auth/login.schema.ts", String.raw`
// web/src/schemas/auth/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Digite um e-mail válido."),
  password: z
    .string()
    .min(1, "Informe sua senha.")
    .min(6, "A senha precisa ter pelo menos 6 caracteres."),
  rememberSession: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
`);

write("src/components/auth/login-form.tsx", String.raw`
// web/src/components/auth/login-form.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { resolveSafePostLoginRedirect } from "@/lib/auth/redirects";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/schemas/auth/login.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => resolveSafePostLoginRedirect(searchParams.get("redirectTo")),
    [searchParams],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberSession: true,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    const supabase = createSupabaseBrowserClient({
      persistSession: values.rememberSession,
    });

    if (!supabase) {
      setFormError(
        "Ambiente de autenticação indisponível. Verifique a configuração pública do Supabase.",
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setFormError("E-mail ou senha inválidos. Verifique os dados e tente novamente.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFormError("Não foi possível acessar agora. Tente novamente em alguns instantes.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-4">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@iris.com"
            className="pl-11"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="pl-11 pr-12"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-[2.45rem] rounded-full p-1 text-foreground-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-focus/20"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Checkbox label="Manter sessão" {...register("rememberSession")} />

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent underline-offset-4 transition hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger"
        >
          {formError}
        </div>
      ) : null}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Acessando...
          </>
        ) : (
          "Acessar painel admin"
        )}
      </Button>

      <p className="text-center text-sm leading-6 text-foreground-secondary">
        Ainda não tem acesso?{" "}
        <Link
          href="/register"
          className="font-medium text-accent underline-offset-4 transition hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
`);

write("src/schemas/botanic/botanic-identity.schema.ts", String.raw`
// web/src/schemas/botanic/botanic-identity.schema.ts
import { z } from "zod";

export const botanicSpeciesCodeSchema = z.enum([
  "IRIS",
  "TULIPA",
  "ORQUIDEA",
  "LOTUS",
  "DENTEDELEAO",
]);

export const botanicStageCodeSchema = z.enum([
  "DORMENTE",
  "BROTO",
  "FLORESCENCIA",
  "BIOMA",
]);

export const botanicInclinationCodeSchema = z.enum([
  "NULO",
  "INTROSPECTIVA",
  "SIMBIOTICA",
  "CULTURAL",
]);

export const imageTransformSchema = z.object({
  cropX: z.number().min(-100).max(100).default(0),
  cropY: z.number().min(-100).max(100).default(0),
  zoom: z.number().min(1).max(3).default(1),
});

export type BotanicSpeciesCode = z.infer<typeof botanicSpeciesCodeSchema>;
export type BotanicStageCode = z.infer<typeof botanicStageCodeSchema>;
export type BotanicInclinationCode = z.infer<typeof botanicInclinationCodeSchema>;
`);

write("src/lib/botanic/identity.ts", String.raw`
// web/src/lib/botanic/identity.ts
import type {
  BotanicInclinationCode,
  BotanicSpeciesCode,
  BotanicStageCode,
} from "@/schemas/botanic/botanic-identity.schema";

type TranslatedBotanicIdentityInput = {
  speciesCode: BotanicSpeciesCode | string;
  stageCode: BotanicStageCode | string;
  inclinationCode: BotanicInclinationCode | string;
  governanceRoleCode?: string | null;
  rootGovernanceEnabled?: boolean;
};

export function translateBotanicIdentityToUi(input: TranslatedBotanicIdentityInput) {
  const speciesLabelMap: Record<string, string> = {
    IRIS: "Fundador / Direção",
    TULIPA: "Equipe IRÍS",
    ORQUIDEA: "Criador Verificado",
    LOTUS: "Assinante Ativo",
    DENTEDELEAO: "Conta Gratuita / Visitante",
  };

  const stageLabelMap: Record<string, string> = {
    DORMENTE: "Leitura restrita",
    BROTO: "Início limitado",
    FLORESCENCIA: "Uso completo",
    BIOMA: "Governança global",
  };

  const inclinationLabelMap: Record<string, string> = {
    NULO: "Sem foco definido",
    INTROSPECTIVA: "Introspecção e diários",
    SIMBIOTICA: "Memórias compartilhadas",
    CULTURAL: "Cultura e descobertas",
  };

  return {
    speciesLabel: speciesLabelMap[input.speciesCode] ?? "Identidade IRÍS",
    stageLabel: stageLabelMap[input.stageCode] ?? "Status protegido",
    inclinationLabel: inclinationLabelMap[input.inclinationCode] ?? "Foco não definido",
    isRootGovernance: Boolean(input.rootGovernanceEnabled && input.speciesCode === "IRIS"),
    governanceLabel:
      input.governanceRoleCode === "founder"
        ? "Fundador"
        : input.governanceRoleCode === "director"
          ? "Direção"
          : input.governanceRoleCode ?? null,
  };
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
  "business_partner",
  "final_customer",
  "supplier",
  "service_provider",
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
  organizationName: z.string().optional(),
  organizationCnpj: z.string().optional(),
  organizationSegment: z.string().optional(),
  businessPhone: z.string().optional(),
  businessPosition: z.string().optional(),

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
        message: "Selecione o tipo de conta externa.",
      });
    }

    if (!value.organizationName || value.organizationName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationName"],
        message: "Informe o nome da organização.",
      });
    }

    if (!value.acceptedPartnerTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acceptedPartnerTerms"],
        message: "Aceite os termos específicos para parceiros/clientes.",
      });
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

write("src/components/onboarding/steps/step-internal-creation-key.tsx", String.raw`
// web/src/components/onboarding/steps/step-internal-creation-key.tsx
import { KeyRound, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { OnboardingStepProps } from "@/components/onboarding/types";

export function StepInternalCreationKey({ form }: Pick<OnboardingStepProps, "form">) {
  const hasInternalCreationKey = form.watch("hasInternalCreationKey");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Chave interna
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Acesso interno com governança.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Funcionários podem seguir sem chave e receber um perfil interno inicial.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <Checkbox
              label="Tenho uma chave de criação"
              {...form.register("hasInternalCreationKey")}
            />

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              A chave é validada somente no servidor. Ela não será salva em texto puro.
            </p>
          </div>
        </div>
      </div>

      {hasInternalCreationKey ? (
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="Chave de criação"
            type="password"
            autoComplete="off"
            placeholder="Insira a chave fornecida pela Root Governance"
            className="pl-11"
            helperText="A chave não será salva em texto puro."
            {...form.register("internalCreationKey")}
          />
        </div>
      ) : null}
    </section>
  );
}
`);

write("src/components/onboarding/steps/step-botanic-identity.tsx", String.raw`
// web/src/components/onboarding/steps/step-botanic-identity.tsx
import { Leaf, Sparkles } from "lucide-react";
import { OptionList } from "@/components/ui/option-list";
import { translateBotanicIdentityToUi } from "@/lib/botanic/identity";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import type { OnboardingFormValues } from "@/schemas/onboarding.schema";

const inclinationOptions = [
  {
    value: "NULO",
    label: "Ainda sem foco definido",
    eyebrow: "Flexível",
    description: "A experiência inicial não força uma direção específica.",
  },
  {
    value: "INTROSPECTIVA",
    label: "Introspecção e diários",
    eyebrow: "Individual",
    description: "Prioriza reflexão, escrita íntima e organização de memória.",
  },
  {
    value: "SIMBIOTICA",
    label: "Memórias compartilhadas",
    eyebrow: "usLIFE",
    description: "Prioriza espaços compartilhados, casal, família ou parceria íntima.",
  },
  {
    value: "CULTURAL",
    label: "Cultura e descobertas",
    eyebrow: "Exploração",
    description: "Prioriza ensaios, repertório, criação, feed cultural e conexões artísticas.",
  },
] as const;

function getPredictedSpecies(accountScope: OnboardingFormValues["accountScope"], externalType?: string) {
  if (accountScope === "internal") return "TULIPA";
  if (
    externalType === "business_partner" ||
    externalType === "supplier" ||
    externalType === "service_provider"
  ) {
    return "ORQUIDEA";
  }

  return "LOTUS";
}

export function StepBotanicIdentity({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const externalAccountType = form.watch("externalAccountType");
  const botanicInclination = form.watch("botanicInclination");

  const predicted = translateBotanicIdentityToUi({
    speciesCode: getPredictedSpecies(accountScope, externalAccountType),
    stageCode: "BROTO",
    inclinationCode: botanicInclination || "NULO",
  });

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Motor Flora
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Defina o foco inicial da experiência.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          A estrutura botânica opera nos bastidores. Na interface, isso aparece como
          status de conta, foco inicial e identificador de suporte.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Leaf className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-medium text-foreground">
              Identidade prevista: {predicted.speciesLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              Status inicial: {predicted.stageLabel}. Foco: {predicted.inclinationLabel}.
            </p>
          </div>
        </div>
      </div>

      <OptionList
        label="Foco inicial"
        description="Escolha como a plataforma deve organizar a primeira experiência desta conta."
        columns={2}
        items={[...inclinationOptions]}
        value={botanicInclination}
        onChange={(value) => {
          form.setValue("botanicInclination", value as OnboardingFormValues["botanicInclination"], {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />

      <div className="rounded-2xl border border-emotion/30 bg-emotion/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-emotion" aria-hidden="true" />
          <p className="text-sm leading-6 text-foreground-secondary">
            Perfis IRIS-BIOMA e permissões supremas não são escolhidos no cadastro.
          </p>
        </div>
      </div>
    </section>
  );
}
`);

write("src/components/onboarding/steps/step-account-summary.tsx", String.raw`
// web/src/components/onboarding/steps/step-account-summary.tsx
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { translateBotanicIdentityToUi } from "@/lib/botanic/identity";
import type { OnboardingFormValues } from "@/schemas/onboarding.schema";

function getPredictedSpecies(values: OnboardingFormValues) {
  if (values.accountScope === "internal") return "TULIPA";

  if (
    values.externalAccountType === "business_partner" ||
    values.externalAccountType === "supplier" ||
    values.externalAccountType === "service_provider"
  ) {
    return "ORQUIDEA";
  }

  return "LOTUS";
}

function SummaryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function StepAccountSummary({ form }: Pick<OnboardingStepProps, "form">) {
  const values = form.getValues();
  const translated = translateBotanicIdentityToUi({
    speciesCode: getPredictedSpecies(values),
    stageCode: "BROTO",
    inclinationCode: values.botanicInclination || "NULO",
  });

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Resumo da conta
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Revise antes de criar.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Esta etapa confirma a conta, o perfil inicial e a identidade operacional que
          será gerada no backend.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SummaryRow label="Nome" value={values.fullName || "Não informado"} />
        <SummaryRow label="Username" value={values.username ? "@" + values.username : "Não informado"} />
        <SummaryRow label="E-mail" value={values.email || "Não informado"} />
        <SummaryRow
          label="Tipo de conta"
          value={values.accountScope === "internal" ? "Interna / Equipe IRÍS" : "Externa / Ecossistema"}
        />
        <SummaryRow
          label="Vínculo"
          value={
            values.accountScope === "internal"
              ? values.internalTeam || "Time não definido"
              : values.organizationName || "Organização não definida"
          }
        />
        <SummaryRow label="Status inicial" value={translated.speciesLabel} />
        <SummaryRow label="Estágio inicial" value={translated.stageLabel} />
        <SummaryRow label="Foco inicial" value={translated.inclinationLabel} />
      </div>

      <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-medium text-foreground">
              Privacidade e segurança preservadas
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              CPF não será salvo puro. O código Flora completo será gerado pelo banco.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm leading-6 text-foreground-secondary">
            Ao concluir, a conta será criada e o onboarding será finalizado sem redirecionamento automático.
          </p>
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
  organizationName: "",
  organizationCnpj: "",
  organizationSegment: "",
  businessPhone: "",
  businessPosition: "",
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
  };
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

  const form = useForm<OnboardingFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const email = form.watch("email");
  const accountScope = form.watch("accountScope");
  const username = form.watch("username");

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
        : [
            { id: "affiliation", label: "Organização" },
            { id: "communication", label: "Contato" },
          ];

    return [
      ...sharedStart,
      ...middle,
      { id: "profile", label: "Usuário" },
      { id: "flora", label: "Flora" },
      { id: "summary", label: "Resumo" },
      { id: "tour", label: "Tour" },
    ];
  }, [accountScope]);

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
    const rawDraft = window.localStorage.getItem("iris-admin-onboarding-draft");

    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Partial<OnboardingFormValues> & {
        currentStep?: number;
      };

      Object.entries(draft).forEach(([key, value]) => {
        if (key === "currentStep") return;
        if (key === "password" || key === "confirmPassword" || key === "cpf") return;
        if (key === "internalCreationKey") return;

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
      return accountScope === "internal"
        ? Boolean(values.internalTeam)
        : Boolean(values.organizationName?.trim());
    }

    if (activeStep === "communication") {
      return accountScope === "internal"
        ? values.notificationChannels.length > 0 && values.notificationTopics.length > 0
        : Boolean(values.businessPosition?.trim()) || Boolean(values.businessPhone?.trim());
    }

    if (activeStep === "profile") {
      return (
        values.fullName.trim().length >= 3 &&
        values.username.trim().length >= 3 &&
        values.acceptedTerms &&
        (accountScope === "internal" || Boolean(values.acceptedPartnerTerms))
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

    const { password: _password, confirmPassword: _confirmPassword, ...payload } = parsed.data;

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

console.log("");
console.log("Setup Flora aplicado em:", webRoot);
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
  console.error("ERRO: typecheck ainda falhou. Copie a saída acima e envie aqui.");
  process.exit(error.status || 1);
}
