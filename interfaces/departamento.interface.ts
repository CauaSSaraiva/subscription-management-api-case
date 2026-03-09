import { type ServiceResult } from "../utils/service-result";

import {
  type DepartamentoResponse,
  type CreateDepartamentoDTO,
} from "../dtos/departamento.dto";
import { type ChartsResponse } from "../dtos/dashboard.dto";

export interface IDepartamentoService {
  criar(
    data: CreateDepartamentoDTO,
  ): Promise<ServiceResult<DepartamentoResponse>>;

  listar(): Promise<ServiceResult<DepartamentoResponse[]>>;

  atualizar(
    data: CreateDepartamentoDTO,
    departamentoId: number,
  ): Promise<ServiceResult<DepartamentoResponse>>;

  deletar(departamentoId: number): Promise<ServiceResult<null>>;

  gastoPorDepartamento(): Promise<ServiceResult<ChartsResponse[]>>
}
