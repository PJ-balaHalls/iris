import { z } from "zod";

export const officialOnboardingStatusSchema = z.object({
  authenticated: z.boolean(),
  completed: z.boolean(),
  profile: z
    .object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
      email: z.string().email(),
      full_name: z.string(),
      nickname: z.string().nullable().optional(),
      username: z.string().nullable().optional(),
      birth_date: z.string(),
      age_years: z.number().int(),
      is_minor: z.boolean(),
      city: z.string(),
      state_code: z.string().nullable().optional(),
      country_code: z.string(),
      species_code: z.string(),
      stage_code: z.string(),
      inclination_code: z.string(),
      onboarding_status: z.string(),
      completed_at: z.string().nullable().optional()
    })
    .nullable()
});

export const completeOfficialOnboardingResultSchema = z.object({
  completed: z.boolean(),
  reason: z.string().optional(),
  profile_id: z.string().uuid().optional(),
  is_minor: z.boolean().optional(),
  age_years: z.number().int().optional(),
  success_route: z.string().optional()
});

export const officialAccountStepSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua pelo menos um número.")
});

export const officialProfileStepSchema = z.object({
  fullName: z.string().min(2, "Informe o nome.").max(120),
  nickname: z.string().min(1, "Informe um apelido.").max(48),
  username: z
    .string()
    .min(3, "Use pelo menos 3 caracteres.")
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _.")
});

export const officialPersonalStepSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD."),
  city: z.string().min(2, "Informe a cidade.").max(120),
  stateCode: z
    .string()
    .min(2, "UF com 2 letras.")
    .max(2, "UF com 2 letras.")
    .regex(/^[A-Za-z]{2}$/, "Use apenas a sigla da UF."),
  countryCode: z.string().default("BRA")
});
