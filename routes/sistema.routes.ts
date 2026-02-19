import { Router } from "express";
import { SistemaController } from "../controllers/sistema.controller";
import { InternalSecret } from "../middlewares/system.secret.middleware";
import { LogsController } from "../controllers/logs.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const sistemaRoutes = Router();
const sistemaController = new SistemaController();
const logsController = new LogsController();

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
