import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import { Prisma } from "../generated/prisma/client";
import { type LogsResponse, type ListLogsDTO } from "../dtos/logs.dto";



export class LogService {
 
  async listar(
    params: ListLogsDTO,
  ): Promise<ServiceResult<LogsResponse[]>> {
    const {
      page,
      limit,
      ordem,
      acao,
      entidade,
      usuarioId,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.LogWhereInput = {
      ...(acao && { acao }),
      ...(entidade && { entidade }),
      ...(usuarioId && { usuarioId }),
    //   ...(search && {
    //     plano: { contains: search, mode: "insensitive" },
    //   }),
    };

    // const ordemTratada = ordem ? ordem : "desc"

    try {
      const [total, logs] = await prisma.$transaction([
        prisma.log.count({ where }),
        prisma.log.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: ordem },
          select: {
            id: true,
            acao: true,
            entidade: true,
            entidadeId: true,
            oldValues: true,
            newValues: true,
            usuarioId: true,
            createdAt: true,
            user: {
              select: { nome: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

    //   const dataFormatada: LogsResponse[] = logs.map((item) => ({
    //     ...item,
    //     preco: item.preco.toString(),
    //   }));

      return {
        ok: true,
        data: logs,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao listar" },
        statusCode: 500,
      };
    }
  }

}
