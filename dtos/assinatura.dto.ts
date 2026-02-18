import { z } from "../utils/zod";
import { AssinaturaStatus, Moeda } from "../generated/prisma/enums";

export const createAssinaturaSchema = z
  .object({
    servicoId: z.uuid("ID do serviço inválido"),
    responsavelId: z.uuid("ID do serviço inválido"),
    departamentoId: z.coerce
      .number("ID de departamento inválido")
      .int("ID de departamento deve ser um inteiro")
      .positive("ID inválido"),
    plano: z.string().min(2, "Nome do plano precisa ter ao menos 2 caracteres"),
    preco: z.number().positive("O preço deve ser um número positivo"),
    moeda: z.enum(Moeda, { error: () => "Valor de moeda inválido" }),
    startDate: z.coerce
      .date({ error: () => "Data de início inválida" })
      .openapi({ example: "2025-09-01" }),
    endDate: z.coerce
      .date()
      .nullable()
      .optional()
      .openapi({ example: "2025-09-01" }),
    nextBilling: z.coerce
      .date({
        error: () => "Data da próxima cobrança inválida",
      })
      .openapi({ example: "2025-09-01" }),
    status: z
      .enum(AssinaturaStatus, { error: () => "Status de assinatura inválido" })
      .optional()
      .default(AssinaturaStatus.ATIVO),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      error: "A data final não pode ser anterior a data de ínicio",
      path: ["endDate"],
    },
  )
  .openapi("CriarAssinaturaInput");

export const updateAssinaturaSchema = z
  .object({
    plano: z
      .string()
      .min(2, "Nome do plano precisa ter ao menos 2 caracteres")
      .optional(),

    preco: z
      .number()
      .positive("O preço deve ser um número positivo")
      .optional(),

    departamentoId: z.coerce
      .number("ID de departamento inválido")
      .int("ID de departamento deve ser um inteiro")
      .positive("ID inválido")
      .optional(),

    startDate: z.coerce
      .date({ error: () => "Data de início inválida" })
      .optional()
      .openapi({ example: "2025-09-01" }),

    endDate: z.coerce
      .date()
      .nullable()
      .optional()
      .openapi({ example: "2025-09-01" }),

    nextBilling: z.coerce
      .date({
        error: () => "Data da próxima cobrança inválida",
      })
      .optional()
      .openapi({ example: "2025-09-01" }),

    status: z
      .enum(AssinaturaStatus, { error: () => "Status de assinatura inválido" })
      .optional()
      .default(AssinaturaStatus.ATIVO),

    version: z.coerce
      .number({ error: () => "A versão do registro é obrigatória" })
      .int()
      .positive(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      error: "A data final não pode ser anterior a data de ínicio",
      path: ["endDate"],
    },
  )
  .openapi("AtualizarAssinaturaInput");

export const listAssinaturaSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.enum(AssinaturaStatus).optional(),
    departamentoId: z.coerce.number().int().positive().optional(),
    servicoId: z.uuid().optional(),
    responsavelId: z.uuid().optional(),
    search: z.string().optional(),
  })
  .openapi("ListarAssinaturasParams");


export const assinaturaResponseSchema = z
  .object({
    id: z.string(),
    servicoId: z.string(),
    responsavelId: z.string(),
    departamentoId: z.number().int(),
    plano: z.string(),
    preco: z.string(),
    moeda: z.enum(Moeda),
    startDate: z.date().openapi({ example: "2025-09-01" }),
    endDate: z.date().nullable().openapi({ example: "2026-09-01" }),
    nextBilling: z.date().openapi({ example: "2026-03-01" }),
    status: z.enum(AssinaturaStatus),
    version: z.number().int(),
    service: z.object({
      nome: z.string(),
    }),
    departamento: z.object({
      descricao: z.string(),
    }),
    responsavel: z.object({
      nome: z.string(),
      email: z.email(),
    }),
  })
  .openapi("AssinaturaResponse");

export const assinaturaDetalhesResponseSchema = assinaturaResponseSchema
  .extend({
    createdAt: z
      .date()
      .openapi({ example: "2025-09-01T00:00:00.000Z" }),
    updatedAt: z
      .date()
      .openapi({ example: "2026-01-15T00:00:00.000Z" }),
    service: z.object({
      nome: z.string(),
      website: z
        .url()
        .nullable()
        .openapi({ example: "https://servico.com" }),
    }),
  })
  .openapi("AssinaturaDetalhesResponse");


export type AssinaturaResponse = z.infer<typeof assinaturaResponseSchema>;
export type AssinaturaDetalhesResponse = z.infer<
  typeof assinaturaDetalhesResponseSchema
>;

export type CreateAssinaturaDTO = z.infer<typeof createAssinaturaSchema>;
export type ListAssinaturaDTO = z.infer<typeof listAssinaturaSchema>;
export type UpdateAssinaturaDTO = z.infer<typeof updateAssinaturaSchema>;
