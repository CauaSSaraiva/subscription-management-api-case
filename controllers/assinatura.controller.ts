import { type Request, type Response } from "express";
import {
  createAssinaturaSchema,
  listAssinaturaSchema,
  updateAssinaturaSchema,
} from "../dtos/assinatura.dto";
import { AssinaturaService } from "../services/assinatura.service";
import { idParamSchema } from "../dtos/params.dto";
import z from "zod";

export class AssinaturaController {
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaService = new AssinaturaService();
  }

  criar = async (req: Request, res: Response) => {
    const validacao = createAssinaturaSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: z.treeifyError(validacao.error),
      });
    }

    const usuarioLogadoId = req.user.sub;
    const resultado = await this.assinaturaService.criar(validacao.data, usuarioLogadoId);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Assinatura criada com sucesso!",
      data: resultado.data,
    });
  };

  listar = async (req: Request, res: Response) => {
    const validacaoParams = listAssinaturaSchema.safeParse(req.query);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "Chamada inválida",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const resultado = await this.assinaturaService.listar(validacaoParams.data);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Assinaturas listadas com sucesso!",
      data: resultado.data,
      meta: resultado.meta,
    });
  };

  listarDetalhes = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de assinatura inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const resultado = await this.assinaturaService.listarDetalhes(id)

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Assinatura listada com sucesso!",
      data: resultado.data,
    });
  };


    atualizar = async (req: Request, res: Response) => {
      const validacaoParams = idParamSchema.safeParse(req.params);

      if (!validacaoParams.success) {
        return res.status(400).json({
          message: "ID de assinatura inválido",
          errors: z.treeifyError(validacaoParams.error),
        });
      }

      const id = validacaoParams.data.id;

      const validacaoBody = updateAssinaturaSchema.safeParse(req.body);

      if (!validacaoBody.success) {
        return res.status(400).json({
          message: "Dados de atualização inválidos",
          errors: z.treeifyError(validacaoBody.error),
        });
      }

      const usuarioLogadoId = req.user.sub;
      const resultado = await this.assinaturaService.atualizar(
        validacaoBody.data,
        id,
        usuarioLogadoId
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
          message: "ID de assinatura inválido",
          errors: z.treeifyError(validacaoParams.error),
        });
      }

      const id = validacaoParams.data.id;

      const usuarioLogadoId = req.user.sub;
      const resultado = await this.assinaturaService.deletar(id, usuarioLogadoId);

      if (!resultado.ok) {
        return res.status(resultado.statusCode).json({
          message: resultado.error.message,
        });
      }

      // 200 no lugar de 204 para devolver json e manter o padrão/contrato
      return res.status(200).json({
        message: "Assinatura removida com sucesso!",
        data: null,
      });
    };
}
