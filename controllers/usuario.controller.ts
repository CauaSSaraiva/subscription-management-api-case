import { type Request, type Response } from "express";
import { createUserSchema } from "../dtos/user.dto";
import { UsuarioService } from "../services/usuario.service";



export class UsuarioController {
    private usuarioService: UsuarioService

    constructor() {
        this.usuarioService = new UsuarioService()
    }

    criar = async (req: Request, res: Response)  => {
        const validation = createUserSchema.safeParse(req.body)

        if (!validation.success) {
          return res.status(400).json({
            message: "Dados inválidos",
            errors: validation.error,
          });
        }

        const resultado = await this.usuarioService.criar(validation.data);

        if (!resultado.ok) {
          return res.status(resultado.statusCode).json({
            message: resultado.error.message,
          });
        }

        return res.status(201).json({
          message: "Usuário criado com sucesso!",
          data: resultado.data,
        });
    }
}