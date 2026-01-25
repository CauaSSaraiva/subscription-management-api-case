import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import { type CreateDepartamentoDTO } from "../dtos/departamento.dto";
import { Prisma } from "../generated/prisma/client";

interface DepartamentoResponse {
  id: number;
  descricao: string;
}

export class DepartamentoService {
  async criar(data: CreateDepartamentoDTO): Promise<ServiceResult<DepartamentoResponse>> {
    try {
      const departamento = await prisma.departamento.create({
        data: {
          descricao: data.descricao,
        },
        select: {
          id: true,
          descricao: true
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
          descricao: true
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
        data: {descricao: data.descricao},
        select: {
          id: true,
          descricao: true
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
}
