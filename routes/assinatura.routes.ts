import { Router } from "express";
import { AssinaturaController } from "../controllers/assinatura.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const assinaturaRoutes = Router();
const assinaturaController = new AssinaturaController()

assinaturaRoutes.post(
  "/",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  assinaturaController.criar
);

assinaturaRoutes.get(
  "/",
  verificarAutenticacao,
  // Permissao([Role.ADMIN, Role.MANAGER]),
  assinaturaController.listar
);

assinaturaRoutes.get(
  "/:id",
  verificarAutenticacao,
  // Permissao([Role.ADMIN, Role.MANAGER]),
  assinaturaController.listarDetalhes
);

assinaturaRoutes.patch(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  assinaturaController.atualizar
);

assinaturaRoutes.delete(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  assinaturaController.deletar
);

export { assinaturaRoutes };
