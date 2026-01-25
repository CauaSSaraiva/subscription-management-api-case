import { z } from "zod";


export const createDepartamentoSchema = z.object({
  descricao: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
});

export type CreateDepartamentoDTO = z.infer<typeof createDepartamentoSchema>;
