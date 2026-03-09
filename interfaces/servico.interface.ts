import { type ServiceResult } from "../utils/service-result";

import {
  type CreateServicoDTO,
  type UpdateServicoDTO,
  type ServicoResponse,
} from "../dtos/servico.dto";

export interface IServicoService {
  criar(data: CreateServicoDTO): Promise<ServiceResult<ServicoResponse>>;

  listar(): Promise<ServiceResult<ServicoResponse[]>>;

  atualizar(
    data: UpdateServicoDTO,
    servicoId: string,
  ): Promise<ServiceResult<ServicoResponse>>;

  deletar(servicoId: string): Promise<ServiceResult<null>>;

  
}