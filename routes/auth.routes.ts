import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";



const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
  "/",
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
