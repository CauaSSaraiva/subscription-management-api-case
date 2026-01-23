import { TokenPayload } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload; // Agora o TS sabe que req.user existe em TODO o projeto
    }
  }
}
