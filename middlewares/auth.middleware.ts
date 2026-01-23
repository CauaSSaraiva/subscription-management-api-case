import jwt from "jsonwebtoken";
import { jwtPayloadSchema } from "../dtos/jwt.dto";
import { type Request, type Response, type NextFunction } from "express";


export function verificarAutenticacao(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Formato inválido de token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const decoded = jwt.verify(token, secret);

    const payload = jwtPayloadSchema.parse(decoded);

    req.user = payload;

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
