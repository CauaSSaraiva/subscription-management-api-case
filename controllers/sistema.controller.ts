import { type Request, type Response } from "express";
import { AssinaturaService } from "../services/assinatura.service";


export class SistemaController {
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaService = new AssinaturaService();
  }

  processarVencimentos = async (req: Request, res: Response) => {

    const resultado = await this.assinaturaService.processarVencimentos();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Cron / Schedule Task de processamento de vencimentos realizado com sucesso!",
      data: resultado.data,
    });
  };

}
