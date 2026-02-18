import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import {
  type CreateServicoDTO,
  type UpdateServicoDTO,
} from "../dtos/servico.dto";
import { Prisma } from "../generated/prisma/client";
import { type ServicoResponse } from "../dtos/servico.dto";

export class ServicoService {
  async criar(data: CreateServicoDTO): Promise<ServiceResult<ServicoResponse>> {
    try {
      const servico = await prisma.servico.create({
        data: {
          nome: data.nome,
          website: data.website ?? null,
        },
        select: {
          id: true,
          nome: true,
          website: true,
        },
      });

      return { ok: true, data: servico };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            ok: false,
            error: { message: "Já existe um serviço com este nome." },
            statusCode: 409,
          };
        }
      }

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async listar(): Promise<ServiceResult<ServicoResponse[]>> {
    try {
      const servicos = await prisma.servico.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          nome: "asc",
        },
        select: {
          id: true,
          nome: true,
          website: true,
          _count: {
            select: {
              assinaturas: true
            }
          }
        },
      });

      return { ok: true, data: servicos };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao listar" },
        statusCode: 500,
      };
    }
  }

  async atualizar(
    data: UpdateServicoDTO,
    servicoId: string,
  ): Promise<ServiceResult<ServicoResponse>> {
    try {
      const servicoExiste = await prisma.servico.findUnique({
        where: {
          id: servicoId,
        },
      });

      if (!servicoExiste) {
        return {
          ok: false,
          error: { message: "Serviço não encontrado" },
          statusCode: 404,
        };
      }

      const dadosParaAtualizar: Prisma.ServicoUpdateInput = {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.website !== undefined && { website: data.website }),
      };

      const servicoAtt = await prisma.servico.update({
        where: {
          id: servicoId,
        },
        data: dadosParaAtualizar,
        select: {
          id: true,
          nome: true,
          website: true,
        },
      });

      return { ok: true, data: servicoAtt };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao atualizar serviço" },
        statusCode: 500,
      };
    }
  }

  async deletar(servicoId: string): Promise<ServiceResult<null>> {
    try {
      const servicoExiste = await prisma.servico.findUnique({
        where: {
          id: servicoId,
        },
      });

      if (!servicoExiste) {
        return {
          ok: false,
          error: { message: "Serviço não encontrado" },
          statusCode: 404,
        };
      }

      const qtdAssinaturas = await prisma.assinatura.count({
        where: {
          servicoId: servicoId,
          deletedAt: null,
          status: 'ATIVO',
        },
      });

      if (qtdAssinaturas > 0) {
        return {
          ok: false,
          error: {
            message:
              "Não é possível deletar serviço com assinaturas ativas",
          },
          statusCode: 500,
        };
      }

      await prisma.servico.update({
        where: {
          id: servicoId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return { ok: true, data: null };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao deletar serviço" },
        statusCode: 500,
      };
    }
  }
}
