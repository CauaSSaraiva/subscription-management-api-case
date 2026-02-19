import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { assinaturaDetalhesResponseSchema, assinaturaResponseSchema, createAssinaturaSchema, listAssinaturaSchema, updateAssinaturaSchema } from '../dtos/assinatura.dto';
import { idParamNumberSchema, idParamSchema } from '../dtos/params.dto';

export const registry = new OpenAPIRegistry();

// import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { loginHttpResponseSchema, loginSchema } from '../dtos/auth.dto';
import { createUsuarioSchema, updateSenhaUsuarioSchema, updateUsuarioSchema, usuarioAdminResponseSchema, usuarioPerfilResponseSchema, usuarioResponseSchema, usuarioSelectResponseSchema } from '../dtos/usuario.dto';
import { chartsResponseSchema, dashboardResponseSchema } from '../dtos/dashboard.dto';
import { createDepartamentoSchema, departamentoResponseSchema } from '../dtos/departamento.dto';
import { createServicoSchema, servicoResponseSchema, updateServicoSchema } from '../dtos/servico.dto';
import { listLogsSchema, logsResponseSchema } from '../dtos/logs.dto';
// extendZodWithOpenApi(z);


// ERROS GENÉRICOS

// O erro de Negócio (Vem dos Services / ServiceResult)
const ServiceErrorSchema = z.object({
  message: z.string().openapi({ example: "Descrição sobre recurso não encontrado ou regra violada" })
}).openapi('ErroNegocio');

// O erro de Validação (Vem do Zod.safeParse no Controller)
const ValidationErrorSchema = z.object({
  message: z.string().openapi({example: "Dados inválidos"}),
  errors: z.any().openapi({ description: "Lista de campos inválidos do Zod" })
}).openapi('ErroValidacao');

// O erro de Auth (Vem do req.user check ou middleware de auth e/ou permissao)
const AuthErrorSchema = z.object({
  error: z.string().openapi({ example: "Não autenticado" })
}).openapi('ErroAutenticacao');

const Erro400Geral = z.union([ValidationErrorSchema, ServiceErrorSchema]);
const sucessoGenericoSchema = z.object({ message: z.string(), data: z.object() }).openapi('SucessoGenerico')



// helper pra criar schema no formato de retorno de sucesso com schemas de response
const createSuccessSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  nome: string,
) =>
  z
    .object({
      message: z.string(),
      data: dataSchema,
    })
    .openapi(nome);


// COMPONENTES 
registry.register('ErroNegocio', ServiceErrorSchema);
registry.register('ErroValidacao', ValidationErrorSchema);
registry.register('ErroAutenticacao', AuthErrorSchema);


// ROTAS AUTH
registry.registerPath({
  method: "post",
  path: "/auth",
  tags: ["Auth"],
  summary: "Fazer Login",
  // security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema ,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(loginHttpResponseSchema, "SucessoLogin"),
        },
      },
    },

    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: ValidationErrorSchema } }, 
    },
    401: {
      description: "Email ou Senha incorretos",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    403: {
      description: "Usuário desativado",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Deslogar",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: sucessoGenericoSchema,
        },
      },
    },

    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: AuthErrorSchema } }, 
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Buscar dados do perfil",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(usuarioPerfilResponseSchema, "SucessoBuscarPerfil"),
        },
      },
    },
    401: {
      description: "Não autenticado.",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    404: {
      description: "Usuário não encontrado ou desativado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});


// ROTAS ASSINATURAS
registry.registerPath({
  method: "post",
  path: "/assinaturas",
  tags: ["Assinaturas"],
  summary: "Cria assinatura",
  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createAssinaturaSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            assinaturaResponseSchema,
            "SucessoCriarAssinatura",
          ) ,
        },
      },
    },

    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: ValidationErrorSchema } }, 
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } }, 
    },
    403: {
      description: "Sem permissão.",
      content: { "application/json": { schema: AuthErrorSchema } }, 
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
    409: {
      description: "Conflito",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/assinaturas",
  tags: ["Assinaturas"],
  summary: "Listar assinaturas com paginação e filtros",
  security: [{ cookieAuth: [] }],

  request: {
    query: listAssinaturaSchema,
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            assinaturaResponseSchema,
            "SucessoListarAssinatura",
          ),
        },
      },
    },
    400: {
      description: "Chamada inválida",
      content: { "application/json": { schema: ValidationErrorSchema } }, 
    },
    500: {
      description: "Erro ao listar",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
  },
});


registry.registerPath({
  method: "get",
  path: "/assinaturas/{id}",
  tags: ["Assinaturas"],
  summary: "Listar detalhes de assinatura especificada",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            assinaturaDetalhesResponseSchema,
            "SucessoCriarAssinatura",
          ),
        },
      },
    },
    400: {
      description: "Chamada inválida",
      content: { "application/json": { schema: ValidationErrorSchema } },
    },
    404: {
      description: "Assinatura não encontrada",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Erro ao buscar assinatura",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/assinaturas/{id}",
  tags: ["Assinaturas"],
  summary: "Atualizar assinatura",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateAssinaturaSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            assinaturaResponseSchema,
            "SucessoCriarAssinatura",
          ),
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    409: {
      description: "Conflito",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/assinaturas/{id}",
  tags: ["Assinaturas"],
  summary: "Deletar assinatura",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: sucessoGenericoSchema,
        },
      },
    },
    400: {
      description: "ID de Assinatura inválido",
      content: {
        "application/json": {
          schema: ValidationErrorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } }, 
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } }, 
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } }, 
    },
  },
});

// ROTAS DASHBOARD

registry.registerPath({
  method: "get",
  path: "/dashboard",
  tags: ["Dashboard"],
  summary: "Listar dados estatísticos para dashboard",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            dashboardResponseSchema,
            "SucessoExibirDadosDashboard",
          ),
        },
      },
    },
    500: {
      description: "Erro ao carregar estatisticas dashboard",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

// ROTAS DEPARTAMENTOS

registry.registerPath({
  method: "post",
  path: "/departamentos",
  tags: ["Departamentos"],
  summary: "Criar departamento",
  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createDepartamentoSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            departamentoResponseSchema,
            "SucessoCriarDepartamento",
          ),
        },
      },
    },

    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: ValidationErrorSchema } },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    409: {
      description: "Conflito",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/departamentos",
  tags: ["Departamentos"],
  summary: "Listar departamentos",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            departamentoResponseSchema,
            "SucessoListarDepartamentos",
          ),
        },
      },
    },
    500: {
      description: "Erro ao listar departamentos",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/departamentos/gastos",
  tags: ["Departamentos"],
  summary: "Listar Gastos por departamento",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            chartsResponseSchema,
            "SucessoListarGastosDepartamentos",
          ),
        },
      },
    },
    500: {
      description: "Erro ao carregar gastos por departamento",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/departamentos/{id}",
  tags: ["Departamentos"],
  summary: "Atualizar departamento",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamNumberSchema,
    body: {
      content: {
        "application/json": {
          schema: createDepartamentoSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            departamentoResponseSchema,
            "SucessoAtualizarDepartamento",
          ),
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/departamentos/{id}",
  tags: ["Departamentos"],
  summary: "Deletar departamento",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamNumberSchema,
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: sucessoGenericoSchema,
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});


// ROTAS SERVIÇOS

registry.registerPath({
  method: "post",
  path: "/servicos",
  tags: ["Serviços"],
  summary: "Criar serviço",
  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createServicoSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            servicoResponseSchema,
            "SucessoCriarServico",
          ),
        },
      },
    },

    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: ValidationErrorSchema } },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    409: {
      description: "Conflito",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});


registry.registerPath({
  method: "get",
  path: "/servicos",
  tags: ["Serviços"],
  summary: "Listar serviços",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            servicoResponseSchema,
            "SucessoListarServicos",
          ),
        },
      },
    },
    500: {
      description: "Erro ao listar serviços",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/servicos/{id}",
  tags: ["Serviços"],
  summary: "Atualizar serviço",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateServicoSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            servicoResponseSchema,
            "SucessoAtualizarServico",
          ),
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/servicos/{id}",
  tags: ["Serviços"],
  summary: "Deletar serviço",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: sucessoGenericoSchema,
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});


// ROTAS USUÁRIOS

registry.registerPath({
  method: "post",
  path: "/usuarios",
  tags: ["Usuários"],
  summary: "Criar usuário",
  security: [{ cookieAuth: [] }],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createUsuarioSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            usuarioResponseSchema,
            "SucessoCriarUsuario",
          ),
        },
      },
    },

    400: {
      description: "Dados inválidos",
      content: { "application/json": { schema: ValidationErrorSchema } },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    409: {
      description: "Conflito",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/usuarios",
  tags: ["Usuários"],
  summary: "Listar usuários",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            usuarioResponseSchema,
            "SucessoListarUsuario",
          ),
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    500: {
      description: "Erro ao listar Usuários",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/usuarios/opcoes",
  tags: ["Usuários"],
  summary: "Listar nomes de usuários para opções (dropdown/select)",
  security: [{ cookieAuth: [] }],

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            usuarioSelectResponseSchema,
            "SucessoListarOpcoesUsuario",
          ),
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    // 403: {
    //   description: "Sem permissão",
    //   content: { "application/json": { schema: AuthErrorSchema } },
    // },
    500: {
      description: "Erro ao listar Usuários",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/usuarios/{id}",
  tags: ["Usuários"],
  summary: "Atualizar usuário",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateUsuarioSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            usuarioAdminResponseSchema,
            "SucessoAtualizarUsuario",
          ),
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/usuarios/{id}/trocar-senha",
  tags: ["Usuários"],
  summary: "Trocar senha do usuário (fluxo 1° acesso)",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateSenhaUsuarioSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            usuarioResponseSchema,
            "SucessoAtualizarSenhaUsuario",
          ),
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    // 403: {
    //   description: "Sem permissão",
    //   content: { "application/json": { schema: AuthErrorSchema } },
    // },
    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/usuarios/{id}",
  tags: ["Usuários"],
  summary: "Deletar usuário",
  security: [{ cookieAuth: [] }],

  request: {
    params: idParamSchema,
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: sucessoGenericoSchema,
        },
      },
    },
    400: {
      description: "Falha na requisição (Validação ou Regra de Negócio)",
      content: {
        "application/json": {
          schema: Erro400Geral,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: { "application/json": { schema: AuthErrorSchema } },
    },
    403: {
      description: "Sem permissão",
      content: { "application/json": { schema: AuthErrorSchema } },
    },

    404: {
      description: "Não encontrado",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});

// ROTAS SISTEMA

registry.registerPath({
  method: "get",
  path: "/sistema/logs",
  tags: ["Sistema"],
  summary: "Listar Logs com paginação e filtros",
  security: [{ cookieAuth: [] }],

  request: {
    query: listLogsSchema,
  },

  responses: {
    200: {
      description: "Sucesso",
      content: {
        "application/json": {
          schema: createSuccessSchema(
            logsResponseSchema,
            "SucessoListarLogs",
          ),
        },
      },
    },
    400: {
      description: "Chamada inválida",
      content: { "application/json": { schema: ValidationErrorSchema } },
    },
    500: {
      description: "Erro ao listar",
      content: { "application/json": { schema: ServiceErrorSchema } },
    },
  },
});


