import { z } from "../utils/zod";

export const loginSchema = z.object({
  email: z.email("Formato de email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
}).openapi("LoginInput")

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    nome: z.string(),
    email: z.email(),
    role: z.string(),
  }),
});

export const loginHttpResponseSchema = loginResponseSchema
  .pick({ user: true })
  .openapi("LoginResponse");

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginHttpResponse = z.infer<typeof loginHttpResponseSchema>;

export type LoginDTO = z.infer<typeof loginSchema>;
