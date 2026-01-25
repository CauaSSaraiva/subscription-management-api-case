import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

usuarioRoutes.post(
  "/",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.criar
);

usuarioRoutes.get(
  "/",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.listar
);

usuarioRoutes.patch(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.atualizar
)

usuarioRoutes.delete(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.deletar
)

export { usuarioRoutes };
