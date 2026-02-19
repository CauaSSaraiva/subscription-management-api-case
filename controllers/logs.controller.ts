import { type Request, type Response } from "express";
import z from "zod";
import { LogService } from "../services/logs.service";
import { listLogsSchema } from "../dtos/logs.dto";

export class LogsController {
  private logsService: LogService;

  constructor() {
    this.logsService = new LogService();
  }

  listar = async (req: Request, res: Response) => {
    const validacaoParams = listLogsSchema.safeParse(req.query);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "Chamada inválida",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const resultado = await this.logsService.listar(validacaoParams.data);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Logs listadas com sucesso!",
      data: resultado.data,
      meta: resultado.meta,
    });
  };
}
