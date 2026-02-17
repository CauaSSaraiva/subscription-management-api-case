import { type Request, type Response } from "express";
import { idParamNumberSchema } from "../dtos/params.dto";
import { DepartamentoService } from "../services/departamento.service";
import { createDepartamentoSchema } from "../dtos/departamento.dto";

import z from "zod";

export class DepartamentoController {
  private departamentoService: DepartamentoService;

  constructor() {
    this.departamentoService = new DepartamentoService();
  }

  criar = async (req: Request, res: Response) => {
    const validacao = createDepartamentoSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: z.treeifyError(validacao.error),
      });
    }

    const resultado = await this.departamentoService.criar(validacao.data);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Departamento criado com sucesso!",
      data: resultado.data,
    });
  };

  listar = async (req: Request, res: Response) => {
    const resultado = await this.departamentoService.listar();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Departamentos listados com sucesso!",
      data: resultado.data,
    });
  };

  gastoPorDepartamento = async (req: Request, res: Response) => {
    const resultado = await this.departamentoService.gastoPorDepartamento();

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(201).json({
      message: "Gastos por departamento listados com sucesso!",
      data: resultado.data,
    });
  };

  atualizar = async (req: Request, res: Response) => {
    console.log(typeof req.params.id)
    const validacaoParams = idParamNumberSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de departamento inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const validacaoBody = createDepartamentoSchema.safeParse(req.body);

    if (!validacaoBody.success) {
      return res.status(400).json({
        message: "Dados de atualização inválidos",
        errors: z.treeifyError(validacaoBody.error),
      });
    }
    const resultado = await this.departamentoService.atualizar(
      validacaoBody.data,
      id,
    );

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Departamento atualizado com sucesso!",
      data: resultado.data,
    });
  };

  deletar = async (req: Request, res: Response) => {
    const validacaoParams = idParamNumberSchema.safeParse(req.params);

    if (!validacaoParams.success) {
      return res.status(400).json({
        message: "ID de departamento inválido",
        errors: z.treeifyError(validacaoParams.error),
      });
    }

    const id = validacaoParams.data.id;

    const resultado = await this.departamentoService.deletar(id);

    
    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    // 200 no lugar de 204 para devolver json e manter o padrão/contrato
    return res.status(200).json({
      message: "Departamento removido com sucesso!",
      data: null,
    });
  };
}
