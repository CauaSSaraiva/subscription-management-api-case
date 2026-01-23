import { z } from "zod";
import { Role } from "../generated/prisma/enums";

export const createUserSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.email("Formato de email inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(Role, { error: () => "Valor de role inválido" }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;