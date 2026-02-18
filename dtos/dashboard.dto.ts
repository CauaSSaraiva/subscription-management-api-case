import { z } from "../utils/zod";

const cardsResponseSchema = z.object({
  totalMensal: z.string().openapi({ example: "R$ 1.250,00" }),
  totalAssinaturas: z.number().int().openapi({ example: 8 }),
  ticketMedio: z.string().openapi({ example: "R$ 156,25" }),
});

export const chartsResponseSchema = z.object({
  departamentoId: z.number().int(),
  descricao: z.string().openapi({ example: "Marketing" }),
  total: z.string().openapi({ example: "R$ 450,00" }),
});

const maisCarosResponseSchema = z.object({
  id: z.string(),
  servico: z.string().openapi({ example: "Adobe Creative Cloud" }),
  linkServico: z
    .url()
    .nullable()
    .openapi({ example: "https://adobe.com" }),
  plano: z.string().openapi({ example: "Teams" }),
  valor: z.string().openapi({ example: "R$ 350,00" }),
});

const proximosVencimentosResponseSchema = z.object({
  id: z.string(),
  servico: z.string().openapi({ example: "Slack" }),
  linkServico: z
    .url()
    .nullable()
    .openapi({ example: "https://slack.com" }),
  valor: z.string().openapi({ example: "R$ 120,00" }),
  vencimento: z.date().openapi({ example: "2026-03-01" }),
  diasRestantes: z.number().int().openapi({ example: 11 }),
});

const listasResponseSchema = z.object({
  maisCaros: z.array(maisCarosResponseSchema),
  proximosVencimentos: z.array(proximosVencimentosResponseSchema),
});


//  Schema principal  

export const dashboardResponseSchema = z
  .object({
    cards: cardsResponseSchema.nullable(),
    charts: z.object({
      porDepartamento: z.array(chartsResponseSchema),
    }),
    listas: listasResponseSchema,
  })
  .openapi("DashboardResponse");

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type ChartsResponse = z.infer<typeof chartsResponseSchema>;

// export dos outros tipos também caso precise futuramente
export type CardsResponse = z.infer<typeof cardsResponseSchema>;
export type MaisCarosResponse = z.infer<typeof maisCarosResponseSchema>;
export type ProximosVencimentosResponse = z.infer<
  typeof proximosVencimentosResponseSchema
>;
