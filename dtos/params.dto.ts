import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("Formato de ID inválido"),
});

export const idParamNumberSchema = z.object({
  id: z.coerce.number("Formato de ID number inválido").int("ID deve ser inteiro").positive("ID inválido")
})
