import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";



const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
  "/",
  authController.login,
);

export { authRoutes };
