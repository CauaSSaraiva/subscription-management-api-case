import { type ServiceResult } from "../utils/service-result";
// import { DepartamentoService } from "./departamento.service";
// import { AssinaturaService } from "./assinatura.service";
import { type DashboardResponse } from "../dtos/dashboard.dto";
import type { IDepartamentoService } from "../interfaces/departamento.interface";
import type { IAssinaturaService } from "../interfaces/assinatura.interface";
import type { IDashboardService } from "../interfaces/dashboard.interface";

export class DashboardService implements IDashboardService {
  constructor(
    private readonly departamentoService: IDepartamentoService,
    private readonly assinaturaService: IAssinaturaService,
  ) {}

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
        cards = {
          totalMensal: kpiRaw.somaPrecos.toFixed(2),
          totalAssinaturas: kpiRaw.totalAssinaturas,
          ticketMedio: kpiRaw.mediaPrecos.toFixed(2),
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
