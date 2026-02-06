// import { TokenPayload } from "../middlewares/auth.middleware";
import { JwtPayload } from "../dtos/jwt.dto";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Agora o TS sabe que req.user existe em TODO o projeto
    }
  }
}
