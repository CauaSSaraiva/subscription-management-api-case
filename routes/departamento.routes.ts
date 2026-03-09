import { Router } from "express";
import { DepartamentoController } from "../controllers/departamento.controller";
import { DepartamentoService } from "../services/departamento.service";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const departamentoRoutes = Router();
const departamentoService = new DepartamentoService
const departamentoController = new DepartamentoController(departamentoService)

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
departamentoRoutes.get(
  "/gastos",
  verificarAutenticacao,
//   Permissao([Role.ADMIN, Role.MANAGER]),
  departamentoController.gastoPorDepartamento
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
