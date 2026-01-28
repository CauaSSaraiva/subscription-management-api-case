import { prisma } from "../prisma";
import { type ServiceResult } from "../utils/service-result";
import { AssinaturaStatus } from "../generated/prisma/client";
import { DateUtils } from "../utils/date.utils";

export interface CardsResponse {
  totalMensal: string;
  totalAssinaturas: number;
  ticketMedio: string;
}

interface ChartsResponse  {
    departamentoId: number,
    descricao: string,
    total: string
}

interface MaisCarosResponse {
    id: string,
    servico: string,
    linkServico: string | null,
    plano: string,
    valor: string
}

interface ProximosVencimentosResponse {
    id: string,
    servico: string,
    linkServico: string | null,
    valor: string,
    vencimento: Date,
    diasRestantes: number
}

interface ListasResponse {
    maisCaros: MaisCarosResponse[],
    proximosVencimentos: ProximosVencimentosResponse[]
}

interface DashboardResponse {
    cards: CardsResponse | null,
    charts: {porDepartamento: ChartsResponse[]},
    listas: ListasResponse
}

export class DashboardService {

  async buscarEstatisticas(): Promise<ServiceResult<DashboardResponse>> {


    try {
 
      const [kpiRaw, porDepartamento, maisCaros, proximosVencimentos] =
        await Promise.all([
          this.buscarKpi(),
          this.buscarPorDepartamento(),
          this.buscarMaisCaros(),
          this.buscarProximosVencimentos(),
        ]);

      let cards = null

      if (kpiRaw) {
        const totalAssinaturas = kpiRaw._count.id ?? 0;
        const totalSoma = Number(kpiRaw._sum.preco ?? 0);
        const ticketMedio = totalAssinaturas > 0 ? totalSoma / totalAssinaturas : 0;

        cards = {
          totalMensal: totalSoma.toFixed(2),
          totalAssinaturas,
          ticketMedio: ticketMedio.toFixed(2),
        }
      }

      return {
        ok: true,
        data: {
          cards, // se der erro vai ser null, pra tratar no front e evitar mostrar um '0' falso
          charts: {
            porDepartamento,
          },
          listas: {
            maisCaros,
            proximosVencimentos,
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao carregar estatisticas dashboard" },
        statusCode: 500,
      };
    }
  }

  private async buscarKpi() {
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

      return kpi;
    } catch (error) {
      console.error(`Não foi possível calcular os KPIs: ${error}`);

      return null;
    }
  }

  private async buscarPorDepartamento(): Promise<ChartsResponse[]> {
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

      const resultado = agrupado.map((item) => ({
        departamentoId: item.departamentoId,
        descricao:
          departamentoMap.get(item.departamentoId) ??
          "Departamento Desconhecido",
        total: item._sum.preco?.toString() ?? "0",
      }));

      return resultado;
    } catch (error) {
      console.error(
        `Não foi possível carregar os dados por departamento: ${error}`,
      );

      return [];
    }
  }

  private async buscarMaisCaros(): Promise<MaisCarosResponse[]> {
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

      return caros.map((item) => ({
        id: item.id,
        servico: item.service.nome,
        linkServico: item.service.website,
        plano: item.plano,
        valor: item.preco.toString(),
      }));
    } catch (error) {
      console.error(
        `Não foi possível carregar as assinaturas mais caras: ${error}`,
      );

      return [];
    }
  }

  private async buscarProximosVencimentos(): Promise<ProximosVencimentosResponse[]> {
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

      return vencimentos.map((item) => ({
        id: item.id,
        servico: item.service.nome,
        linkServico: item.service.website,
        valor: item.preco.toString(),
        vencimento: item.nextBilling, 
        diasRestantes: this.calcularDiasRestantes(item.nextBilling),
      }));
    } catch (error) {
      console.error(
        "Não foi possível carregar os próximos vencimentos:",
        error,
      );

      return [];
    }
  }

  // helper pro front
  private calcularDiasRestantes(dataAlvo: Date): number {
    const agoraUtc = DateUtils.inicioDiaUTC(new Date());
    const diferencaMs = dataAlvo.getTime() - agoraUtc.getTime();
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
  }
}
