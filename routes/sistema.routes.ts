import { Router } from "express";
import { SistemaController } from "../controllers/sistema.controller";
import { InternalSecret } from "../middlewares/system.secret.middleware";
import { LogsController } from "../controllers/logs.controller";
import { LogService } from "../services/logs.service";
import { AssinaturaService } from "../services/assinatura.service";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const sistemaRoutes = Router();

const logService = new LogService()
const assinaturaService = new AssinaturaService()

const logsController = new LogsController(logService);
const sistemaController = new SistemaController(assinaturaService);

sistemaRoutes.post(
  "/cron-vencimentos",
  InternalSecret,
  sistemaController.processarVencimentos,
);

sistemaRoutes.get(
  "/logs",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  logsController.listar,
);

export { sistemaRoutes };
