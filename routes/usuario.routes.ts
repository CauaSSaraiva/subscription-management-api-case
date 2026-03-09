import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { UsuarioService } from "../services/usuario.service";
import { verificarAutenticacao } from "../middlewares/auth.middleware";
import { Permissao } from "../middlewares/permissions.middleware";
import { Role } from "../generated/prisma/enums";

const usuarioRoutes = Router();
const usuarioService = new UsuarioService()
const usuarioController = new UsuarioController(usuarioService);

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
usuarioRoutes.get(
  "/opcoes",
  verificarAutenticacao,
  // Permissao([Role.ADMIN]),
  usuarioController.listarParaSelect
);

usuarioRoutes.patch(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.atualizar
)

usuarioRoutes.patch(
  "/:id/trocar-senha",
  verificarAutenticacao,
  // Permissao([Role.ADMIN]),
  usuarioController.atualizarSenha
)

usuarioRoutes.delete(
  "/:id",
  verificarAutenticacao,
  Permissao([Role.ADMIN]),
  usuarioController.deletar
)

export { usuarioRoutes };
