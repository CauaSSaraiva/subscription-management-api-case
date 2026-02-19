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
// import { LogAction } from "./logger.service";
import { LogAction } from "../generated/prisma/client";
import  { type LogEntryParams } from "./logger.service";
import { type AssinaturaResponse, type AssinaturaDetalhesResponse } from "../dtos/assinatura.dto";

interface MaisCarosResponse {
  id: string;
  servico: string;
  linkServico: string | null;
  plano: string;
  valor: string;
}

interface ProximosVencimentosResponse {
  id: string;
  servico: string;
  linkServico: string | null;
  valor: string;
  vencimento: Date;
  diasRestantes: number;
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
          version: true,

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
        usuarioId: usuarioLogadoId,
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
            version: true,
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
          version: true,
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
          version: true,
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

      const dadosParaAtualizar: Prisma.AssinaturaUpdateManyMutationInput = {
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
        version: {
          increment: 1,
        },
      };

      const resultado = await prisma.assinatura.updateMany({
        where: {
          id: assinaturaId,
          version: data.version,
          deletedAt: null,
        },
        data: dadosParaAtualizar,
      });

      if (resultado.count === 0) {
        return {
          ok: false,
          error: {
            message:
              "O registro foi modificado por outro usuário. Por favor, recarregue a página e tente novamente.",
          },
          statusCode: 409,
        };
      }

      const assinaturaAtt = await prisma.assinatura.findUniqueOrThrow({
        where: { id: assinaturaId },
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
          version: true,
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
      });

      LoggerService.log({
        usuarioId: usuarioLogadoId,
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
          deletedAt: new Date(),
        },
      });

      LoggerService.log({
        usuarioId: usuarioLogadoId,
        acao: LogAction.DELETE,
        entidade: "Assinatura",
        entidadeId: assinaturaId,
        oldValues: assinaturaExiste,
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

  async buscarKpi() {
    try {
      const kpi = await prisma.assinatura.aggregate({
        where: {
          deletedAt: null,
          status: AssinaturaStatus.ATIVO,
        },
        _avg: { preco: true },
        _count: { id: true },
        _sum: { preco: true },
      });

      return { ok: true, data: kpi };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao buscar kpi" },
        statusCode: 500,
      };
    }
  }

  async buscarMaisCaros(): Promise<ServiceResult<MaisCarosResponse[]>> {
    try {
      const caros = await prisma.assinatura.findMany({
        select: {
          id: true,
          plano: true,
          preco: true,
          startDate: true,
          endDate: true,
          nextBilling: true,
          service: {
            select: {
              nome: true,
              website: true,
            },
          },
        },
        where: {
          deletedAt: null,
          status: AssinaturaStatus.ATIVO,
        },
        orderBy: {
          preco: "desc",
        },
        take: 5,
      });

      const resultado = caros.map((item) => ({
        id: item.id,
        servico: item.service.nome,
        linkServico: item.service.website,
        plano: item.plano,
        valor: item.preco.toString(),
      }));

      return { ok: true, data: resultado };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao buscar Assinaturas mais caras" },
        statusCode: 500,
      };
    }
  }

  async buscarProximosVencimentos(): Promise<
    ServiceResult<ProximosVencimentosResponse[]>
  > {
    try {
      const hoje = new Date();
      const dataInicio = DateUtils.inicioDiaUTC(hoje);

      const dataDaqui30Dias = new Date(hoje);
      dataDaqui30Dias.setDate(hoje.getDate() + 30);

      const dataFim = DateUtils.fimDiaUTC(dataDaqui30Dias);

      const vencimentos = await prisma.assinatura.findMany({
        where: {
          status: AssinaturaStatus.ATIVO,
          deletedAt: null,
          nextBilling: {
            gte: dataInicio, // Maior ou igual ao início de hoje
            lte: dataFim, // Menor ou igual ao fim do dia 30
          },
        },
        orderBy: {
          nextBilling: "asc",
        },
        take: 10,
        select: {
          id: true,
          preco: true,
          nextBilling: true,
          service: {
            select: {
              nome: true,
              website: true,
            },
          },
        },
      });

      const resultado = vencimentos.map((item) => ({
        id: item.id,
        servico: item.service.nome,
        linkServico: item.service.website,
        valor: item.preco.toString(),
        vencimento: item.nextBilling,
        diasRestantes: this.calcularDiasRestantes(item.nextBilling),
      }));

      return { ok: true, data: resultado };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            "Erro ao buscar próximos vencimentos/cobranças de assinaturas",
        },
        statusCode: 500,
      };
    }
  }

  async processarVencimentos(): Promise<
    ServiceResult<{
      expirados: number;
      pendentes: number;
    }>
  > {
    try {
      const hoje = new Date();
      const dataInicio = DateUtils.inicioDiaUTC(hoje);
      const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID;

      if (!SYSTEM_USER_ID) {
        return { 
          ok: false, 
          error: { message: "System User Id não está configurado" }, 
          statusCode: 500 
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        
        // usando o updateMany com retorno, para garantirmos que, caso um update não aconteça por conta da trava adicional no where
        // que existe pro caso de concorrência durante o tempo de execução do cron + alguém alterar o status
        // não geremos logs falsos para ações que não ocorreram no sistema, e sim, para updates que realmente ocorreram
        const atualizadosExpirados = await tx.assinatura.updateManyAndReturn({
          where: {
            status: AssinaturaStatus.ATIVO, // trava de concorrência
            deletedAt: null,
            endDate: { lte: dataInicio },
          },
          data: { status: AssinaturaStatus.EXPIRADO },
          select: { id: true }, // só o necessário
        });

        const atualizadosPendentes = await tx.assinatura.updateManyAndReturn({
          where: {
            status: AssinaturaStatus.ATIVO, 
            deletedAt: null,
            nextBilling: { lte: dataInicio },
            OR: [{ endDate: null }, { endDate: { gt: dataInicio } }],
          },
          data: { status: AssinaturaStatus.RENOVACAO_PENDENTE },
          select: { id: true },
        });


        // criando logs que serão gerados com integridade, usando como base o retorno dos próprios updateManyAndReturn
        const logs: LogEntryParams[] = [];


        if (atualizadosExpirados.length > 0) {
          logs.push(...atualizadosExpirados.map((reg): LogEntryParams => ({
            usuarioId: SYSTEM_USER_ID,
            acao: LogAction.UPDATE,
            entidade: "Assinatura",
            entidadeId: reg.id,
            oldValues: { status: AssinaturaStatus.ATIVO },
            newValues: { status: AssinaturaStatus.EXPIRADO }
          })));
        }

        if (atualizadosPendentes.length > 0) {
          logs.push(...atualizadosPendentes.map((reg): LogEntryParams => ({
            usuarioId: SYSTEM_USER_ID,
            acao: LogAction.UPDATE,
            entidade: "Assinatura",
            entidadeId: reg.id,
            oldValues: { status: AssinaturaStatus.ATIVO },
            newValues: { status: AssinaturaStatus.RENOVACAO_PENDENTE },
          })));
        }

        if (logs.length > 0) {
          await LoggerService.logMany(logs, tx);
        }

        return {
          expirados: atualizadosExpirados.length,
          pendentes: atualizadosPendentes.length,
        };
      });

      return { ok: true, data: result };

    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro crítico ao processar vencimentos" },
        statusCode: 500,
      };
    }
  }


  // helper pro front
  private calcularDiasRestantes(dataAlvo: Date): number {
    const agoraUtc = DateUtils.inicioDiaUTC(new Date());
    const diferencaMs = dataAlvo.getTime() - agoraUtc.getTime();
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
  }

}
