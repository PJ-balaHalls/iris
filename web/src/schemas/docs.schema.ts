// web/src/schemas/docs.schema.ts
import { z } from "zod";

export const docsCategorySchema = z.enum(["guide", "api", "legal", "blog", "community"]);
export const docsComplexitySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const articleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "O slug precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hifens."),
  description: z.string().max(300, "A descrição deve ter no máximo 300 caracteres.").optional(),
  content: z.string().min(10, "O conteúdo não pode estar vazio."),
  category: docsCategorySchema,
  subcategory: z.string().optional(),
  icon: z.string().optional(),
  complexity: docsComplexitySchema.default("beginner"),
  estimated_reading_time: z.number().min(1, "Tempo mínimo é 1 minuto.").max(120),
  is_published: z.boolean().default(false),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
