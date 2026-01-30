import { type Request, type Response } from "express";
import { loginSchema } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";
import z from "zod";




export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    const validation = loginSchema.safeParse(req.body);

    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown";

    if (!validation.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: z.treeifyError(validation.error),
      });
    }

    const resultado = await this.authService.login(
      validation.data,
      ip,
      userAgent,
    );

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    const emProducao = process.env.NODE_ENV === "production";

    res.cookie("token", resultado.data.token, {
      httpOnly: true,
      secure: emProducao, // HTTPS em produção
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: "/",
    });

    return res.status(201).json({
      message: "Login realizado com sucesso!",
      data: resultado.data.user,
    });
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  };

  buscarPerfil = async (req: Request, res: Response) => {
    // ja ta no middle
    return res.status(200).json(req.user);
  };
}