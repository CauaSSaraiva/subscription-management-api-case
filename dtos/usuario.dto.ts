import { z } from "../utils/zod";
import { Role } from "../generated/prisma/enums";

export const createUsuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.email("Formato de email inválido"),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .optional(),
  role: z.enum(Role, { error: () => "Valor de role inválido" }),
});

export const updateSenhaUsuarioSchema = z.object({
  senhaAtual: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  novaSenha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const updateUsuarioSchema = createUsuarioSchema
  .omit({ email: true, senha: true })
  .partial();


export const usuarioResponseSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    email: z.email(),
    role: z.string(),
  })
  .openapi("UsuarioResponse");

export const usuarioAdminResponseSchema = usuarioResponseSchema
  .extend({
    deletedAt: z.date().nullable().optional(),
    createdAt: z.date(),
  })
  .openapi("UsuarioAdminResponse");

// Omit funciona igual ao TypeScript
export const usuarioSelectResponseSchema = usuarioResponseSchema
  .omit({
    email: true,
    role: true,
  })
  .openapi("UsuarioSelectResponse");

export const usuarioPerfilResponseSchema = usuarioResponseSchema
  .extend({
    precisaTrocarSenha: z.boolean(),
  })
  .openapi("UsuarioPerfilResponse");

export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
export type UsuarioAdminResponse = z.infer<typeof usuarioAdminResponseSchema>;
export type UsuarioSelectResponse = z.infer<typeof usuarioSelectResponseSchema>;
export type UsuarioPerfilResponse = z.infer<typeof usuarioPerfilResponseSchema>;

export type CreateUsuarioDTO = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioDTO = z.infer<typeof updateUsuarioSchema>;
export type UpdateSenhaUsuarioDTO = z.infer<typeof updateSenhaUsuarioSchema>;
