import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import { type CreateDepartamentoDTO } from "../dtos/departamento.dto";
import { AssinaturaStatus, Prisma } from "../generated/prisma/client";
import { type DepartamentoResponse } from "../dtos/departamento.dto";
import { type ChartsResponse } from "../dtos/dashboard.dto";

export class DepartamentoService {
  async criar(
    data: CreateDepartamentoDTO,
  ): Promise<ServiceResult<DepartamentoResponse>> {
    try {
      const departamento = await prisma.departamento.create({
        data: {
          descricao: data.descricao,
        },
        select: {
          id: true,
          descricao: true,
        },
      });

      return { ok: true, data: departamento };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            ok: false,
            error: { message: "Já existe um departamento com este nome." },
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

  async listar(): Promise<ServiceResult<DepartamentoResponse[]>> {
    try {
      const departamentos = await prisma.departamento.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          descricao: "asc",
        },
        select: {
          id: true,
          descricao: true,
          _count: {
            select: {
              assinaturas: true,
            },
          },
        },
      });

      return { ok: true, data: departamentos };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao listar departamentos" },
        statusCode: 500,
      };
    }
  }

  async atualizar(
    data: CreateDepartamentoDTO,
    departamentoId: number,
  ): Promise<ServiceResult<DepartamentoResponse>> {
    try {
      const departamentoExiste = await prisma.departamento.findUnique({
        where: {
          id: departamentoId,
        },
      });

      if (!departamentoExiste) {
        return {
          ok: false,
          error: { message: "Departamento não encontrado" },
          statusCode: 404,
        };
      }

      const departamentoAtt = await prisma.departamento.update({
        where: {
          id: departamentoId,
        },
        data: { descricao: data.descricao },
        select: {
          id: true,
          descricao: true,
        },
      });

      return { ok: true, data: departamentoAtt };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao atualizar departamento" },
        statusCode: 500,
      };
    }
  }

  async deletar(departamentoId: number): Promise<ServiceResult<null>> {
    try {
      const departamentoExiste = await prisma.departamento.findUnique({
        where: {
          id: departamentoId,
        },
      });

      if (!departamentoExiste) {
        return {
          ok: false,
          error: { message: "Departamento não encontrado" },
          statusCode: 404,
        };
      }

      const qtdAssinaturas = await prisma.assinatura.count({
        where: {
          departamentoId: departamentoId,
          deletedAt: null,
          status:'ATIVO',
        },
      });

      if (qtdAssinaturas > 0) {
        return {
          ok: false,
          error: { message: "Não é possível deletar departamento com assinaturas ativas" },
          statusCode: 500,
        };
      }

      await prisma.departamento.update({
        where: {
          id: departamentoId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return { ok: true, data: null };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao deletar departamento" },
        statusCode: 500,
      };
    }
  }

  async gastoPorDepartamento(): Promise<ServiceResult<ChartsResponse[]>> {
    try {
      const agrupado = await prisma.assinatura.groupBy({
        by: ["departamentoId"],
        where: {
          deletedAt: null,
          status: AssinaturaStatus.ATIVO,
        },
        _sum: { preco: true },
      });

      // evitando n+1  com agrupamento de consultas (batching)
      const departamentosIds = agrupado.map((item) => item.departamentoId);

      const departamentos = await prisma.departamento.findMany({
        where: {
          id: { in: departamentosIds },
        },
        select: {
          id: true,
          descricao: true,
        },
      });

      const departamentoMap = new Map<number, string>();

      for (const d of departamentos) {
        departamentoMap.set(d.id, d.descricao);
      }

      // Application-Side Join
      const resultado = agrupado.map((item) => ({
        departamentoId: item.departamentoId,
        descricao:
          departamentoMap.get(item.departamentoId) ??
          "Departamento Desconhecido",
        total: item._sum.preco?.toString() ?? "0",
      }));

      return {
        ok: true,
        data: resultado,
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao carregar gastos por departamento" },
        statusCode: 500,
      };
    }
  }
}
