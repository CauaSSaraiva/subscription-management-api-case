import { z } from "zod";
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
    startDate: z.coerce.date({ error: () => "Data de início inválida" }),
    endDate: z.coerce.date().nullable().optional(),
    nextBilling: z.coerce.date({
      error: () => "Data da próxima cobrança inválida",
    }),
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
  );

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
      .optional(),

    endDate: z.coerce.date().nullable().optional(),

    nextBilling: z.coerce
      .date({
        error: () => "Data da próxima cobrança inválida",
      })
      .optional(),

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
  );

export const listAssinaturaSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(AssinaturaStatus).optional(),
  departamentoId: z.coerce.number().int().positive().optional(),
  servicoId: z.uuid().optional(),
  responsavelId: z.uuid().optional(),
  search: z.string().optional(),
});

export type CreateAssinaturaDTO = z.infer<typeof createAssinaturaSchema>;
export type ListAssinaturaDTO = z.infer<typeof listAssinaturaSchema>;
export type UpdateAssinaturaDTO = z.infer<typeof updateAssinaturaSchema>;
