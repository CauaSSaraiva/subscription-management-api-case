import { z } from "../utils/zod";
import { LogAction, Entidade } from "../generated/prisma/enums";

export const Ordem = {
  Antigos: "asc",
  Recentes: "desc",
} as const; // "read-only"
export type OrdemType = (typeof Ordem)[keyof typeof Ordem];

export const listLogsSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    ordem: z.enum(Ordem).optional().default("desc"),
    acao: z.enum(LogAction).optional(),
    entidade: z.enum(Entidade).optional(),
    usuarioId: z.uuid().optional(),
  })
  .openapi("ListarLogsParams");

export const logsResponseSchema = z
  .object({
    id: z.uuid(),
    acao: z.enum(LogAction),
    entidade: z.enum(Entidade),
    entidadeId: z.uuid(),
    // z.json() o typescript entra em parafuso ao comparar com json do prisma
    oldValues: z.any().optional().openapi({
      type: "object",
      description: "Snapshot do estado anterior (JSON)",
    }),
    newValues: z.any().optional().openapi({
      type: "object",
      description: "Snapshot do estado novo (JSON)",
    }),
    user: z.object({
      nome: z.string(),
    }),
    usuarioId: z.uuid(),
    createdAt: z.date(),
  })
  .openapi("LogsResponse");

export type LogsResponse = z.infer<typeof logsResponseSchema>;
export type ListLogsDTO = z.infer<typeof listLogsSchema>;
