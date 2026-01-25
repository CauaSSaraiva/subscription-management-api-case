import { Router } from "express";
import { DepartamentoController } from "../controllers/departamento.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const departamentoRoutes = Router();
const departamentoController = new DepartamentoController()

departamentoRoutes.post(
  "/",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  departamentoController.criar
);

departamentoRoutes.get(
  "/",
  verificarAutenticacao,
//   Permissao([Role.ADMIN, Role.MANAGER]),
  departamentoController.listar
);

departamentoRoutes.patch(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  departamentoController.atualizar
);

departamentoRoutes.delete(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN, Role.MANAGER]),
  departamentoController.deletar
);

export { departamentoRoutes };
