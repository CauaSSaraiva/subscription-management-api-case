import { type Request, type Response } from "express";
import { createServicoSchema } from "../dtos/servico.dto";
import { ServicoService } from "../services/servico.service";
import { idParamSchema } from "../dtos/params.dto";
import { updateServicoSchema } from "../dtos/servico.dto";
import z from "zod";

export class ServicoController {
  private servicoService: ServicoService;

  constructor() {
    this.servicoService = new ServicoService();
  }

  criar = async (req: Request, res: Response) => {
    const validacao = createServicoSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: z.treeifyError(validacao.error),
      });
    }

    const resultado = await this.servicoService.criar(validacao.data);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Serviço criado com sucesso!",
      data: resultado.data,
    });
  };

  listar = async (req: Request, res: Response) => {
    const resultado = await this.servicoService.listar();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Serviços listados com sucesso!",
      data: resultado.data,
    });
  };

  atualizar = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de serviço inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const validacaoBody = updateServicoSchema.safeParse(req.body);

    if (!validacaoBody.success) {
      return res.status(400).json({
        message: "Dados de atualização inválidos",
        errors: z.treeifyError(validacaoBody.error),
      });
    }
    const resultado = await this.servicoService.atualizar(
      validacaoBody.data,
      id,
    );

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Serviço atualizado com sucesso!",
      data: resultado.data,
    });
  };

  deletar = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de serviço inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const resultado = await this.servicoService.deletar(id);

    
    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    // 200 no lugar de 204 para devolver json e manter o padrão/contrato
    return res.status(200).json({
      message: "Serviço removido com sucesso!",
      data: null,
    });
  };
}
