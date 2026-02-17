import { type Request, type Response, type NextFunction } from "express";

export function InternalSecret(req: Request, res: Response, next: NextFunction) {
 
const secret = req.headers["x-internal-secret"];

if (secret !== process.env.INTERNAL_API_SECRET) {
  return res
    .status(403)
    .json({ error: "Acesso Proibido." });
}

next();
}
