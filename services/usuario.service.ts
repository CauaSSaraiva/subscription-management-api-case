import { prisma } from "../prisma";
import { hash, compare } from "bcrypt";
import { type CreateUsuarioDTO } from "../dtos/usuario.dto";
import { type ServiceResult } from "../utils/service-result";
import { type UpdateUsuarioDTO } from "../dtos/usuario.dto";
import type { UpdateSenhaUsuarioDTO } from "../dtos/usuario.dto";
import { Prisma } from "../generated/prisma/client";
import { LogAction, LoggerService } from "./logger.service";

import {
  type UsuarioResponse,
  type UsuarioAdminResponse,
  type UsuarioSelectResponse,
  type UsuarioPerfilResponse,
} from "../dtos/usuario.dto";

export class UsuarioService {
  private gerarSenhaPadrao(nome: string): string {
    const nomeLimpo = nome.trim();
    const primeiroNome = nomeLimpo.split(" ")[0] || "Usuario";

    const formatado =
      primeiroNome.charAt(0).toUpperCase() +
      primeiroNome.slice(1).toLowerCase();

    return `Mudar.${formatado}123`;
  }

  async criar(data: CreateUsuarioDTO): Promise<ServiceResult<UsuarioResponse>> {
    const senhaPlain = data.senha || this.gerarSenhaPadrao(data.nome);
    const senhaHash = await hash(senhaPlain, 6);

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
          deletedAt: null,
        },
      });
      return { ok: true, data: usuarios };
    } catch (error) {
      console.error(error);

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async listarParaSelect(): Promise<ServiceResult<UsuarioSelectResponse[]>> {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
        },
        where: {
          deletedAt: null,
        },
      });
      return { ok: true, data: usuarios };
    } catch (error) {
      console.error(error);

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async buscarPerfil(
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioPerfilResponse>> {
    try {
      const usuarios = await prisma.usuario.findUnique({
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          precisaTrocarSenha: true,
        },
        where: {
          id: usuarioId,
          deletedAt: null,
        },
      });

      if (!usuarios) {
        return {
          ok: false,
          error: {
            message: "Usuario com id especificado não encontrado ou desativado",
          },
          statusCode: 404,
        };
      }
      return { ok: true, data: usuarios };
    } catch (error) {
      console.error(error);

      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }

  async atualizar(
    data: UpdateUsuarioDTO,
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioAdminResponse>> {
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

      if (usuarioExiste.email === "admin@empresa.com") {
        return {
          ok: false,
          error: {
            message: "Não é permitido alterar o usuário admin da demonstração.",
          },
          statusCode: 403,
        };
      }

      const dadosParaAtualizar: Prisma.UsuarioUpdateInput = {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.role !== undefined && { role: data.role }),
      };

      const usuarioAtt = await prisma.usuario.update({
        where: {
          id: usuarioId,
        },
        data: dadosParaAtualizar,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true,
        },
      });

      return { ok: true, data: usuarioAtt };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao atualizar usuário" },
        statusCode: 500,
      };
    }
  }

  async atualizarSenha(
    data: UpdateSenhaUsuarioDTO,
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioResponse>> {
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

      // trava pro case
      if (usuarioExiste.email === "admin@empresa.com") {
        return {
          ok: false,
          error: {
            message:
              "Não é permitido alterar a senha do usuário admin da demonstração.",
          },
          statusCode: 403,
        };
      }

      const senhaBate = await compare(data.senhaAtual, usuarioExiste.senha);

      if (!senhaBate) {
        return {
          ok: false,
          error: { message: "Senha atual incorreta" },
          statusCode: 401,
        };
      }

      // --

      const novoHash = await hash(data.novaSenha, 6);

      const usuarioAtt = await prisma.usuario.update({
        where: {
          id: usuarioId,
        },
        data: { senha: novoHash, precisaTrocarSenha: false },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
        },
      });

      LoggerService.log({
        usuarioId: usuarioId,
        acao: LogAction.UPDATE,
        entidade: "Usuario",
        entidadeId: usuarioId,
        oldValues: {
          senha: "*** REDACTED ***",
          precisaTrocarSenha: usuarioExiste.precisaTrocarSenha,
        },
        newValues: {
          senha: "*** REDACTED ***",
          precisaTrocarSenha: false,
        },
      });

      return { ok: true, data: usuarioAtt };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Erro ao atualizar senha do usuário" },
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

      if (usuarioExiste.email === "admin@empresa.com") {
        return {
          ok: false,
          error: {
            message: "Não é permitido excluir o usuário admin da demonstração.",
          },
          statusCode: 403,
        };
      }

      const qtdResponsavel = await prisma.assinatura.count({
        where: {
          responsavelId: usuarioId,
          status: "ATIVO",
        },
      });

      if (qtdResponsavel > 0) {
        return {
          ok: false,
          error: {
            message:
              "Não é possível deletar usuarios responsaveis de alguma assinatura",
          },
          statusCode: 500,
        };
      }

      await prisma.usuario.update({
        where: {
          id: usuarioId,
        },
        data: {
          deletedAt: new Date(),
        },
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
