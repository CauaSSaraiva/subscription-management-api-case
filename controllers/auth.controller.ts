import { type Request, type Response } from "express";
import { loginSchema } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";
import { UsuarioService } from "../services/usuario.service";
import z from "zod";
import { idParamSchema } from "../dtos/params.dto";

export class AuthController {
  private authService: AuthService;
  private usuarioService: UsuarioService;

  constructor() {
    this.authService = new AuthService();
    this.usuarioService = new UsuarioService();
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
    const id = req.user?.sub;

    console.log(id)

    // em teoria nunca acontecerá por conta do middleware
    if (!id) {
      return res.status(401).json({
        message: "Usuário não autenticado no contexto",
      });
    }

    const resultado = await this.usuarioService.buscarPerfil(id);

    if (!resultado.ok) {
      return res.status(resultado.statusCode).json({
        message: resultado.error.message,
      });
    }

    return res.status(200).json({
      message: "Dados de perfil buscados com sucesso!",
      data: resultado.data,
    });
  };
}
