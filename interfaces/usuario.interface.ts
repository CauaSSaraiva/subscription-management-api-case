import { type ServiceResult } from "../utils/service-result";

import {
  type CreateUsuarioDTO,
  type UpdateUsuarioDTO,
  type UpdateSenhaUsuarioDTO,
  type UsuarioResponse,
  type UsuarioAdminResponse,
  type UsuarioSelectResponse,
  type UsuarioPerfilResponse,
} from "../dtos/usuario.dto";

export interface IUsuarioService {

  criar(data: CreateUsuarioDTO): Promise<ServiceResult<UsuarioResponse>>;

  listar(): Promise<ServiceResult<UsuarioResponse[]>>;

  listarParaSelect(): Promise<ServiceResult<UsuarioSelectResponse[]>>;

  buscarPerfil(
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioPerfilResponse>>;

  atualizar(
    data: UpdateUsuarioDTO,
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioAdminResponse>>;

  atualizarSenha(
    data: UpdateSenhaUsuarioDTO,
    usuarioId: string,
  ): Promise<ServiceResult<UsuarioResponse>>;

  deletar(usuarioId: string): Promise<ServiceResult<null>>;


}

