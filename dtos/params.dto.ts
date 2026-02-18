import { z } from "../utils/zod";

export const idParamSchema = z
  .object({
    id: z.uuid("Formato de ID inválido"),
  })
  .openapi("ParamsIdI");

export const idParamNumberSchema = z.object({
  id: z.coerce
    .number("Formato de ID number inválido")
    .int("ID deve ser inteiro")
    .positive("ID inválido"),
});
