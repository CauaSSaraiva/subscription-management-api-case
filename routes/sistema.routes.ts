import { Router } from "express";
import { SistemaController } from "../controllers/sistema.controller";
import { InternalSecret } from "../middlewares/system.secret.middleware";

const sistemaRoutes = Router();
const sistemaController = new SistemaController();

sistemaRoutes.post(
    "/cron-vencimentos",
    InternalSecret,
    sistemaController.processarVencimentos
);

export { sistemaRoutes };
