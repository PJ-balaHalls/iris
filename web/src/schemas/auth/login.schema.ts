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
