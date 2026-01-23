import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Formato de email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type LoginDTO = z.infer<typeof loginSchema>;