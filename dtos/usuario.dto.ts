import { z } from "zod";
import { Role } from "../generated/prisma/enums";

export const createUsuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.email("Formato de email inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(Role, { error: () => "Valor de role inválido" }),
});

export const updateUsuarioSchema = createUsuarioSchema.omit({email: true, senha: true}).partial();

export type CreateUsuarioDTO = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioDTO = z.infer<typeof updateUsuarioSchema>;