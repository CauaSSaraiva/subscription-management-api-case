import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { AssinaturaService } from "../services/assinatura.service";
import { DepartamentoService } from "../services/departamento.service";
import { DashboardService } from "../services/dashboard.service";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
// import { Permissao } from "../middlewares/permissions.middleware";
// import { Role } from "../generated/prisma/enums";

const dashboardRoutes = Router();

const departamentoService = new DepartamentoService()
const assinaturaService = new AssinaturaService()


const dashboardService = new DashboardService(departamentoService, assinaturaService)
const dashboardController = new DashboardController(dashboardService)

dashboardRoutes.get(
  "/",
  verificarAutenticacao,
//   Permissao([Role.ADMIN, Role.MANAGER]),
  dashboardController.exibirEstatisticas
);

export { dashboardRoutes };
