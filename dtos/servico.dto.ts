import { z } from "zod";


export const createServicoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  website: z.url("Link inválido").optional(),
});

export const updateServicoSchema = createServicoSchema.partial()

export type CreateServicoDTO = z.infer<typeof createServicoSchema>;
export type UpdateServicoDTO = z.infer<typeof updateServicoSchema>