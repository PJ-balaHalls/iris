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
