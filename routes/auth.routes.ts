import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rate.limiter.middleware";
import { AuthService } from "../services/auth.service";
import { UsuarioService } from "../services/usuario.service";



const authRoutes = Router();

const authService = new AuthService()
const usuarioService = new UsuarioService()

const authController = new AuthController(authService, usuarioService);

authRoutes.post(
  "/",
  authLimiter,
  authController.login,
);

authRoutes.post(
  "/logout",
  verificarAutenticacao,
  authController.logout,
);

authRoutes.get(
  "/me",
  verificarAutenticacao,
  authController.buscarPerfil,
);

export { authRoutes };
