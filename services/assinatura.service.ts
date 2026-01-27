import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import { Prisma } from "../generated/prisma/client";
import {
  type CreateAssinaturaDTO,
  type ListAssinaturaDTO,
  type UpdateAssinaturaDTO,
} from "../dtos/assinatura.dto";
import { Moeda, AssinaturaStatus } from "../generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { DateUtils } from "../utils/date.utils";
import { LoggerService } from "./logger.service";
import { LogAction } from "./logger.service";

interface AssinaturaResponse {
  id: string;
  servicoId: string;
  responsavelId: string;
  departamentoId: number;
  plano: string;
  preco: string;
  moeda: Moeda;
  startDate: Date;
  endDate: Date | null;
  nextBilling: Date;
  status: AssinaturaStatus;
  service: {
    nome: string;
  };
  departamento: {
    descricao: string;
  };
  responsavel: {
    nome: string;
    email: string;
  };
}

interface AssinaturaDetalhesResponse extends AssinaturaResponse {
  createdAt: Date;
  updatedAt: Date;
  service: {
    nome: string;
    website: string | null;
  };
}

export class AssinaturaService {
  async criar(
    data: CreateAssinaturaDTO,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<AssinaturaResponse>> {
    const startDate = DateUtils.inicioDiaUTC(data.startDate);
    const endDate = data.endDate ? DateUtils.fimDiaUTC(data.endDate) : null;
    const nextBilling = DateUtils.inicioDiaUTC(data.nextBilling);

    try {
      const [servicoExiste, usuarioExiste, departamentoExiste] =
        await Promise.all([
          prisma.servico.findUnique({ where: { id: data.servicoId } }),
          prisma.usuario.findUnique({ where: { id: data.responsavelId } }),
          prisma.departamento.findUnique({
            where: { id: data.departamentoId },
          }),
        ]);

      if (!servicoExiste || !usuarioExiste || !departamentoExiste) {
        return {
          ok: false,
          error: { message: "Serviço, usuario ou departamento não encontrado" },
          statusCode: 404,
        };
      }

      const assinatura = await prisma.assinatura.create({
        data: {
          servicoId: data.servicoId,
          responsavelId: data.responsavelId,
          departamentoId: data.departamentoId,
          plano: data.plano,
          preco: new Decimal(data.preco),
          moeda: data.moeda,
          startDate: startDate,
          endDate: endDate,
          nextBilling: nextBilling,
          status: data.status,
        },
        select: {
          id: true,
          servicoId: true,
          responsavelId: true,
          departamentoId: true,
          plano: true,
          preco: true,
          moeda: true,
          startDate: true,
          endDate: true,
          nextBilling: true,
          status: true,

          service: {
            select: {
              nome: true,
            },
          },
          departamento: {
            select: {
              descricao: true,
            },
          },
          responsavel: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      });

      LoggerService.log({
        userId: usuarioLogadoId,
        acao: LogAction.CREATE,
        entidade: "Assinatura",
        entidadeId: assinatura.id,
        newValues: assinatura, // Salva o objeto criado
      });

      return {
        ok: true,
        data: {
          ...assinatura,
          preco: assinatura.preco.toString(),
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            ok: false,
            error: { message: "Já existe uma assinatura com estes dados." },
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

  async listar(
    params: ListAssinaturaDTO,
  ): Promise<ServiceResult<AssinaturaResponse[]>> {
    const {
      page,
      limit,
      search,
      status,
      servicoId,
      responsavelId,
      departamentoId,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.AssinaturaWhereInput = {
      deletedAt: null, // soft delete sempre
      ...(status && { status }),
      ...(servicoId && { servicoId }),
      ...(responsavelId && { responsavelId }),
      ...(departamentoId && { departamentoId }),
      ...(search && {
        plano: { contains: search, mode: "insensitive" },
      }),
    };

    try {
      const [total, assinaturas] = await prisma.$transaction([
        prisma.assinatura.count({ where }),
        prisma.assinatura.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            servicoId: true,
            responsavelId: true,
            departamentoId: true,
            plano: true,
            preco: true,
            moeda: true,
            startDate: true,
            endDate: true,
            nextBilling: true,
            status: true,
            service: {
              select: { nome: true },
            },
            departamento: {
              select: { descricao: true },
            },
            responsavel: {
              select: { nome: true, email: true },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const dataFormatada: AssinaturaResponse[] = assinaturas.map((item) => ({
        ...item,
        preco: item.preco.toString(),
      }));

      return {
        ok: true,
        data: dataFormatada,
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
  async listarDetalhes(
    assinaturaId: string,
  ): Promise<ServiceResult<AssinaturaDetalhesResponse>> {
    try {
      const assinatura = await prisma.assinatura.findUnique({
        where: {
          id: assinaturaId,
        },
        select: {
          id: true,
          servicoId: true,
          responsavelId: true,
          departamentoId: true,
          plano: true,
          preco: true,
          moeda: true,
          startDate: true,
          endDate: true,
          nextBilling: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          service: {
            select: { nome: true, website: true },
          },
          departamento: {
            select: { descricao: true },
          },
          responsavel: {
            select: { nome: true, email: true },
          },
        },
      });

      if (!assinatura) {
        return {
          ok: false,
          error: { message: "Assinatura não encontrada" },
          statusCode: 404,
        };
      }

      const dataFormatada: AssinaturaDetalhesResponse = {
        ...assinatura,
        preco: assinatura.preco.toString(),
      };

      return {
        ok: true,
        data: dataFormatada,
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao buscar assinatura" },
        statusCode: 500,
      };
    }
  }

  async atualizar(
    data: UpdateAssinaturaDTO,
    assinaturaId: string,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<AssinaturaResponse>> {
    try {
      const assinaturaExiste = await prisma.assinatura.findUnique({
        where: {
          id: assinaturaId,
        },
      });

      if (!assinaturaExiste) {
        return {
          ok: false,
          error: { message: "Assinatura não encontrada" },
          statusCode: 404,
        };
      }

      //  sanitização datas UTC

      const startDateNormalizado = data.startDate
        ? DateUtils.inicioDiaUTC(data.startDate)
        : undefined;

      // pode ser explicitamente null (para remover data fim)
      let endDateNormalizado: Date | null | undefined = undefined;
      if (data.endDate !== undefined) {
        endDateNormalizado = data.endDate
          ? DateUtils.fimDiaUTC(data.endDate)
          : null;
      }

      const nextBillingNormalizado = data.nextBilling
        ? DateUtils.inicioDiaUTC(data.nextBilling)
        : undefined;

      //  Validação regra de negócio além da presente no DTO: pra garantir casos onde só endDate é atualizado
      //  (ele não tem acesso ao 'startDate' que já está salvo no banco)
      const startDateChecar =
        startDateNormalizado ?? assinaturaExiste.startDate;

      const endDateChecar =
        endDateNormalizado !== undefined // se for undefined mantém
          ? endDateNormalizado
          : assinaturaExiste.endDate;

      if (endDateChecar && endDateChecar < startDateChecar) {
        return {
          ok: false,
          error: {
            message: "A data final não pode ser anterior à data de início",
          },
          statusCode: 400,
        };
      }

      const dadosParaAtualizar: Prisma.AssinaturaUpdateInput = {
        ...(data.plano !== undefined && { plano: data.plano }),
        ...(data.preco !== undefined && { preco: data.preco }),
        ...(data.departamentoId !== undefined && {
          departamentoId: data.departamentoId,
        }),
        ...(data.status !== undefined && { status: data.status }),

        // usa as variavel sanitizada.
        ...(startDateNormalizado !== undefined && {
          startDate: startDateNormalizado,
        }),
        ...(endDateNormalizado !== undefined && {
          endDate: endDateNormalizado,
        }),
        ...(nextBillingNormalizado !== undefined && {
          nextBilling: nextBillingNormalizado,
        }),
      };

      const assinaturaAtt = await prisma.assinatura.update({
        where: {
          id: assinaturaId,
        },
        data: dadosParaAtualizar,
        select: {
          id: true,
          servicoId: true,
          responsavelId: true,
          departamentoId: true,
          plano: true,
          preco: true,
          moeda: true,
          startDate: true,
          endDate: true,
          nextBilling: true,
          status: true,

          service: {
            select: {
              nome: true,
            },
          },
          departamento: {
            select: {
              descricao: true,
            },
          },
          responsavel: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      });

      LoggerService.log({
        userId: usuarioLogadoId,
        acao: LogAction.UPDATE,
        entidade: "Assinatura",
        entidadeId: assinaturaId,
        oldValues: assinaturaExiste,
        newValues: assinaturaAtt,
      });

      const dataFormatada: AssinaturaResponse = {
        ...assinaturaAtt,
        preco: assinaturaAtt.preco.toString(),
      };

      return { ok: true, data: dataFormatada };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao atualizar assinatura" },
        statusCode: 500,
      };
    }
  }

  async deletar(
    assinaturaId: string,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<null>> {
    try {
      const assinaturaExiste = await prisma.assinatura.findUnique({
        where: {
          id: assinaturaId,
        },
      });

      if (!assinaturaExiste) {
        return {
          ok: false,
          error: { message: "Assinatura não encontrada" },
          statusCode: 404,
        };
      }

      await prisma.assinatura.update({
        where: {
          id: assinaturaId,
        },
        data: {
          ativo: false,
          deletedAt: new Date(),
        },
      });

      LoggerService.log({
        userId: usuarioLogadoId,
        acao: LogAction.DELETE,
        entidade: "Assinatura",
        entidadeId: assinaturaId,
        oldValues: assinaturaExiste
      });

      return { ok: true, data: null };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao deletar assinatura" },
        statusCode: 500,
      };
    }
  }
}
