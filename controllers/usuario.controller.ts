import { type Request, type Response } from "express";
import { createUsuarioSchema, updateUsuarioSchema, updateSenhaUsuarioSchema } from "../dtos/usuario.dto";
import { UsuarioService } from "../services/usuario.service";
import { idParamSchema } from "../dtos/params.dto";
import z from "zod";

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  criar = async (req: Request, res: Response) => {
    const validacao = createUsuarioSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: z.treeifyError(validacao.error),
      });
    }

    const resultado = await this.usuarioService.criar(validacao.data);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      data: resultado.data,
    });
  };

  listar = async (req: Request, res: Response) => {
    const resultado = await this.usuarioService.listar();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Usuários listados com sucesso",
      data: resultado.data,
    });
  };

  listarParaSelect = async (req: Request, res: Response) => {
    const resultado = await this.usuarioService.listarParaSelect();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Usuários listados com sucesso",
      data: resultado.data,
    });
  };

  atualizar = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de usuário inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const validacaoBody = updateUsuarioSchema.safeParse(req.body);

    if (!validacaoBody.success) {
      return res.status(400).json({
        message: "Dados de atualização inválidos",
        errors: z.treeifyError(validacaoBody.error),
      });
    }

    const resultado = await this.usuarioService.atualizar(validacaoBody.data, id);
    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      data: resultado.data,
    });
  };
  atualizarSenha = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de usuário inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const validacaoBody = updateSenhaUsuarioSchema.safeParse(req.body);

    if (!validacaoBody.success) {
      return res.status(400).json({
        message: "Dados de atualização inválidos",
        errors: z.treeifyError(validacaoBody.error),
      });
    }

    const resultado = await this.usuarioService.atualizarSenha(validacaoBody.data, id);
    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      data: resultado.data,
    });
  };

  deletar = async (req: Request, res: Response) => {
    const validacaoParams = idParamSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de usuário inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const resultado = await this.usuarioService.deletar(id);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }
    
    // 200 no lugar de 204 para devolver json e manter o padrão/contrato
    return res.status(200).json({
      message: "Usuário removido com sucesso!",
      data: null
    });
  };
}
