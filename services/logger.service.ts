import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";

export const LogAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const; // "read-only"


export type LogActionType = (typeof LogAction)[keyof typeof LogAction];

export interface LogEntryParams {
  usuarioId: string;
  acao: LogActionType | string;
  entidade: "Assinatura" | "Usuario" | "Servico" | "Departamento";
  entidadeId: string;
  oldValues?: Prisma.InputJsonObject;
  newValues?: Prisma.InputJsonObject;
}


export class LoggerService {
  static async log(params: LogEntryParams) {
    /**
     * Registra log de auditoria.
     * Este método deve ser chamado sem 'await' para não travar/atrasar o service/rota em questão.
     */
    try {
      await prisma.log.create({
        data: {
          usuarioId: params.usuarioId,
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

  static async logMany(
    logs: LogEntryParams[],
    tx: Prisma.TransactionClient = prisma // Default: prisma global se não passar tx
  ) {
    /**
     * Registra múltiplos logs de auditoria.
     * Este método deve ser chamado SEMPRE COM 'await' se utilizado com tx/transaction.
     */
    if (logs.length === 0) return;

    try {
      // formato do Prisma (tratando DbNull)
      const data = logs.map((log) => ({
        usuarioId: log.usuarioId,
        acao: log.acao,
        entidade: log.entidade,
        entidadeId: log.entidadeId,
        oldValues: log.oldValues ?? Prisma.DbNull,
        newValues: log.newValues ?? Prisma.DbNull,
      }));

      await tx.log.createMany({
        data,
      });
    } catch (error) {
      throw error;
    }
  }
}
