import { prisma } from "../prisma";
import { hash } from "bcrypt";
import { type CreateUsuarioDTO } from "../dtos/usuario.dto";
import { type ServiceResult } from "../utils/service-result";
import { type UpdateUsuarioDTO } from "../dtos/usuario.dto";
import { Prisma } from "../generated/prisma/client";

interface UsuarioResponse  {
  id: string;
  nome: string;
  email: string;
  role: string;
};

interface UsuarioAdminResponse extends UsuarioResponse {
  deletedAt?: Date | null;
  createdAt: Date;
  ativo: boolean;
};


export class UsuarioService {
  async criar(
    data: CreateUsuarioDTO,
  ): Promise<ServiceResult<UsuarioResponse>> {
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

      return { ok: true, data: usuario };
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

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async listar(): Promise<ServiceResult<UsuarioResponse[]>> {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
        },
        where: {
          ativo: true,
        },
      });
      return { ok: true, data: usuarios };
    } catch (error) {
      console.error(error)

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async atualizar(data: UpdateUsuarioDTO, usuarioId: string): Promise<ServiceResult<UsuarioAdminResponse>> {
    try {
      const usuarioExiste = await prisma.usuario.findUnique({
        where: {
          id: usuarioId
        }
      })

      if (!usuarioExiste) {
        return { ok: false, error: { message: "Usuário não encontrado" }, statusCode: 404 };
      }

      const dadosParaAtualizar: Prisma.UsuarioUpdateInput = {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.role !== undefined && { role: data.role }),
      };


      const usuarioAtt = await prisma.usuario.update({
        where: {
          id: usuarioId
        },
        data: dadosParaAtualizar,
        select: {
          id: true, 
          nome: true, 
          email: true, 
          role: true, 
          createdAt: true,
          ativo: true
        }
      })

      return {ok: true, data: usuarioAtt}
    } catch (error) {
      
      return {
        ok: false,
        error: { message: "Erro ao atualizar usuário" },
        statusCode: 500,
      };
    }
  }
   
  async deletar(usuarioId: string): Promise<ServiceResult<null>> {
    try {
      const usuarioExiste = await prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },
      });

      if (!usuarioExiste) {
        return {
          ok: false,
          error: { message: "Usuário não encontrado" },
          statusCode: 404,
        };
      }

      await prisma.usuario.update({
        where: {
          id: usuarioId,
        },
        data: {
          ativo: false,
          deletedAt: new Date()
        }
      });

      return { ok: true, data: null };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao deletar usuário" },
        statusCode: 500,
      };
    }
  }
}
