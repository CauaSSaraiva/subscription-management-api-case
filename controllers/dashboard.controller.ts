import { type Request, type Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  exibirEstatisticas = async (req: Request, res: Response) => {
    const resultado = await this.dashboardService.buscarEstatisticas();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Dados da dashboard carregados com sucesso!",
      data: resultado.data,
    });
  };
}
