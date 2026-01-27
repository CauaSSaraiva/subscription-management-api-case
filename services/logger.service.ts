import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";

export const LogAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const; // "read-only"


export type LogActionType = (typeof LogAction)[keyof typeof LogAction];


export class LoggerService {
  /**
   * Registra um log de auditoria.
   * Este método deve ser chamado sem 'await' para não travar/atrasar o service/rota em questão.
   */
  static async log(params: {
    userId: string;
    acao: LogActionType | string;
    entidade: "Assinatura" | "Usuario" | "Servico" | "Departamento";
    entidadeId: string;
    oldValues?: Prisma.InputJsonObject;
    newValues?: Prisma.InputJsonObject;
  }) {
    try {
      await prisma.log.create({
        data: {
          usuarioId: params.userId,
          acao: params.acao,
          entidade: params.entidade,
          entidadeId: params.entidadeId,
          // JSON Null do Prisma (diferente do 'null')
          oldValues: params.oldValues ?? Prisma.DbNull,
          newValues: params.newValues ?? Prisma.DbNull,
        },
      });
    } catch (error) {
      console.error("Falha ao criar Log:", error);
    }
  }
}
