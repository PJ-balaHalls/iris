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
