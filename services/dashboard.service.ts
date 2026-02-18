import { type ServiceResult } from "../utils/service-result";
import { DepartamentoService } from "./departamento.service";
import { AssinaturaService } from "./assinatura.service";
import { type DashboardResponse } from "../dtos/dashboard.dto";


export class DashboardService {
  private departamentoService: DepartamentoService;
  private assinaturaService: AssinaturaService;

  constructor() {
    this.departamentoService = new DepartamentoService();
    this.assinaturaService = new AssinaturaService();
  }

  async buscarEstatisticas(): Promise<ServiceResult<DashboardResponse>> {
    try {
      const [kpiRes, porDepartamentoRes, maisCarosRes, proximosVencimentosRes] =
        await Promise.all([
          this.assinaturaService.buscarKpi(),
          this.departamentoService.gastoPorDepartamento(),
          this.assinaturaService.buscarMaisCaros(),
          this.assinaturaService.buscarProximosVencimentos(),
        ]);

      let cards = null;

      const kpiRaw = kpiRes.ok ? kpiRes.data : null;
      const porDepartamento =
        porDepartamentoRes.ok && porDepartamentoRes.data
          ? porDepartamentoRes.data
          : [];
      const maisCaros = maisCarosRes.ok ? maisCarosRes.data : [];
      const proximosVencimentos = proximosVencimentosRes.ok
        ? proximosVencimentosRes.data
        : [];

      if (kpiRaw) {
        const totalAssinaturas = kpiRaw._count.id ?? 0;
        const totalSoma = Number(kpiRaw._sum.preco ?? 0);
        const ticketMedio =
          totalAssinaturas > 0 ? totalSoma / totalAssinaturas : 0;

        cards = {
          totalMensal: totalSoma.toFixed(2),
          totalAssinaturas,
          ticketMedio: ticketMedio.toFixed(2),
        };
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
}
