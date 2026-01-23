import { prisma } from "../prisma";
import { hash, compare } from "bcrypt";
import { type LoginDTO } from "../dtos/auth.dto";
import jwt from "jsonwebtoken";
import { type ServiceResult } from "../utils/service-result";
import { AcessoStatus } from "../generated/prisma/enums";

type LoginResponse = {
  token: string;
  user: {
    nome: string;
    email: string;
    role: string;
  };
};

const FAKE_HASH = process.env.FAKE_HASH!;
const { sign} = jwt;

export class AuthService {
  async login(
    data: LoginDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<ServiceResult<LoginResponse>> {


    try {
      const user = await prisma.usuario.findUnique({
        where: { email: data.email },
      });

      // timing attack
      if (!user) {
        await compare(data.senha, FAKE_HASH);

        await prisma.logAcesso.create({
          data: {
            email: data.email,
            ip: ipAddress,
            userAgent,
            status: AcessoStatus.FAILURE,
            motivo: "USER_NOT_FOUND",
          },
        });

        return {
          ok: false,
          error: { message: "E-mail ou senha incorretos" },
          statusCode: 401,
        };
      }

      const comparacao = await compare(data.senha, user.senha);

      if (!comparacao) {
        await prisma.logAcesso.create({
          data: {
            userId: user.id,
            email: data.email,
            ip: ipAddress,
            userAgent,
            status: AcessoStatus.FAILURE,
            motivo: "INVALID_PASSWORD",
          },
        });

        return {
          ok: false,
          error: { message: "E-mail ou senha incorretos" },
          statusCode: 401,
        };
      }

      if (!user.ativo) {
        return {
          ok: false,
          error: { message: "Usuário desativado." },
          statusCode: 403,
        };
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET não configurado");
      }

      const token = sign(
        {
          role: user.role,
          nome: user.nome,
        },
        process.env.JWT_SECRET,
        {
          subject: user.id,
          expiresIn: "1d",
        },
      );

      return {
        ok: true,
        data: {
          token,
          user: {
            nome: user.nome,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: { message: "Internal Server Error" },
        statusCode: 500,
      };
    }
  }
}
