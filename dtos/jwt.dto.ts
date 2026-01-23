import { z } from "zod";

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]),
  nome: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;