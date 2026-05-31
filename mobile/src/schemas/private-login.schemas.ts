// mobile/src/schemas/private-login.schemas.ts
import { z } from "zod";

export const privateLoginEntrySchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  kind: z.string().min(1),
  relationship_label: z.string().nullable().optional()
});

export const privateLoginEntryPointsSchema = z.object({
  enabled: z.boolean(),
  entries: z.array(privateLoginEntrySchema)
});

export const privateLoginQuizOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  sort_order: z.number().int()
});

export const privateLoginQuizQuestionSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string().min(1),
  helper_text: z.string().nullable().optional(),
  sort_order: z.number().int(),
  options: z.array(privateLoginQuizOptionSchema).length(3)
});

export const privateLoginQuizTargetSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  name: z.string().min(1),
  required_question_count: z.number().int().min(1),
  required_correct_answers: z.number().int().min(1)
});

export const privateLoginQuizSchema = z.object({
  enabled: z.boolean(),
  target: privateLoginQuizTargetSchema.nullable(),
  questions: z.array(privateLoginQuizQuestionSchema)
});

export const privateLoginAnswerPayloadSchema = z.object({
  question_id: z.string().uuid(),
  option_id: z.string().uuid()
});

export const verifyPrivateLoginStepResultSchema = z.object({
  valid: z.boolean(),
  correct: z.boolean(),
  reason: z.string().optional()
});

export const verifyPrivateLoginResultSchema = z.object({
  granted: z.boolean(),
  reason: z.string().optional(),
  session_id: z.string().uuid().optional(),
  success_route: z.string().optional(),
  correct_count: z.number().int().optional(),
  required_count: z.number().int().optional(),
  profile: z
    .object({
      target_id: z.string().uuid().optional(),
      slug: z.string().min(1),
      label: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      full_name: z.string().nullable().optional(),
      nickname: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional(),
      profile_payload: z.record(z.string(), z.unknown()).optional().default({})
    })
    .optional()
});

export const privateAccessSessionSchema = z.object({
  session_id: z.string().uuid(),
  target_id: z.string().uuid().nullable().optional(),
  slug: z.string().min(1),
  label: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  success_route: z.string().nullable().optional(),
  profile_payload: z.record(z.string(), z.unknown()).optional().default({}),
  granted_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional()
});

export const myPrivateAccessResultSchema = z.object({
  authenticated: z.boolean(),
  sessions: z.array(privateAccessSessionSchema)
});