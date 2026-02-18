import { z } from "../utils/zod";

export const createServicoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  website: z.url("Link inválido").optional(),
});

export const servicoResponseSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    website: z.url().nullable(),
  })
  .openapi("ServicoResponse");

export const updateServicoSchema = createServicoSchema.partial();

export type ServicoResponse = z.infer<typeof servicoResponseSchema>;
export type CreateServicoDTO = z.infer<typeof createServicoSchema>;
export type UpdateServicoDTO = z.infer<typeof updateServicoSchema>;
