import { type Request, type Response } from "express";
// import { AssinaturaService } from "../services/assinatura.service";
import type { IAssinaturaService } from "../interfaces/assinatura.interface";


export class SistemaController {

  constructor(private readonly assinaturaService: IAssinaturaService) {}

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
