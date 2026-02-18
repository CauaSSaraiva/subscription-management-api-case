import { z } from "../utils/zod";

export const createDepartamentoSchema = z.object({
  descricao: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
});

export const departamentoResponseSchema = z
  .object({
    id: z.number().int(),
    descricao: z.string(),
  })
  .openapi("DepartamentoResponse");

  
export type DepartamentoResponse = z.infer<typeof departamentoResponseSchema>;
export type CreateDepartamentoDTO = z.infer<typeof createDepartamentoSchema>;
