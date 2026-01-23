import { type Request, type Response } from "express";
import { loginSchema } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";



export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    login = async (req: Request, res: Response)  => {
        const validation = loginSchema.safeParse(req.body)

        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown";

        if (!validation.success) {
          return res.status(400).json({
            message: "Dados inválidos",
            errors: validation.error,
          });
        }

        const resultado = await this.authService.login(validation.data, ip, userAgent);

        if (!resultado.ok) {
          return res.status(resultado.statusCode).json({
            message: resultado.error.message,
          });
        }

        return res.status(201).json({
          message: "Login realizado com sucesso!",
          data: resultado.data,
        });
    }
}