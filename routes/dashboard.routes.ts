import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const dashboardRoutes = Router();
const dashboardController = new DashboardController()

dashboardRoutes.get(
  "/",
  verificarAutenticacao,
//   Permissao([Role.ADMIN, Role.MANAGER]),
  dashboardController.exibirEstatisticas
);

export { dashboardRoutes };
