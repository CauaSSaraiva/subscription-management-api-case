import { type Request, type Response, type NextFunction } from "express";
import { type Role } from "../generated/prisma/enums"; 

export function Permissao(rolesPermitidos: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {

    // O middleware de Auth deve ter rodado antes
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    // Verificação de Role
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Acesso negado: Você não tem permissão para realizar esta ação.",
      });
    }

    return next();
  };
}
