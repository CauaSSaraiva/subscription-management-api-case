import { Router } from "express";
import { ServicoController } from "../controllers/servico.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const servicoRoutes = Router();
const servicoController = new ServicoController()

servicoRoutes.post(
  "/",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  servicoController.criar
);

servicoRoutes.get(
  "/",
  verificarAutenticacao,
  // Permissao([Role.ADMIN, Role.MANAGER]),
  servicoController.listar
);

servicoRoutes.patch(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  servicoController.atualizar
);

servicoRoutes.delete(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  servicoController.deletar
);

export { servicoRoutes };
