import { prisma } from "../prisma";
import { hash } from "bcrypt";
import { type CreateUserDTO } from "../dtos/user.dto";
import { type ServiceResult } from "../utils/service-result";
import { Prisma } from "../generated/prisma/client";

type CreateUserResponse = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

export class UsuarioService {
  async criar(data: CreateUserDTO): Promise<ServiceResult<CreateUserResponse>> {

    const senhaHash = await hash(data.senha, 6);

    try {

        const usuario = await prisma.usuario.create({
          data: {
            nome: data.nome,
            email: data.email,
            senha: senhaHash,
            role: data.role,
          },
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });

        return {ok: true, data: usuario}

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            ok: false,
            error: { message: "E-mail já cadastrado." },
            statusCode: 409,
          };
        }
      }

      // desconhecido -> Global Error Handler (ou try/catch do controller)
      throw error;
    }
  }
}
