import { type ServiceResult } from "../utils/service-result";

import {
  type CreateAssinaturaDTO,
  type ListAssinaturaDTO,
  type UpdateAssinaturaDTO,
  type AssinaturaResponse,
  type AssinaturaDetalhesResponse,
} from "../dtos/assinatura.dto";

export interface MaisCarosResponse {
  id: string;
  servico: string;
  linkServico: string | null;
  plano: string;
  valor: string;
}

export interface ProximosVencimentosResponse {
  id: string;
  servico: string;
  linkServico: string | null;
  valor: string;
  vencimento: Date;
  diasRestantes: number;
}

export interface KpiResult {
  totalAssinaturas: number;
  somaPrecos: number;
  mediaPrecos: number;
}

export interface IAssinaturaService {
  criar(
    data: CreateAssinaturaDTO,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<AssinaturaResponse>>;

  listar(
    params: ListAssinaturaDTO,
  ): Promise<ServiceResult<AssinaturaResponse[]>>;

  listarDetalhes(
    assinaturaId: string,
  ): Promise<ServiceResult<AssinaturaDetalhesResponse>>;

  atualizar(
    data: UpdateAssinaturaDTO,
    assinaturaId: string,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<AssinaturaResponse>>;

  deletar(
    assinaturaId: string,
    usuarioLogadoId: string,
  ): Promise<ServiceResult<null>>;

  buscarKpi(): Promise<ServiceResult<KpiResult>>;

  buscarMaisCaros(): Promise<ServiceResult<MaisCarosResponse[]>>;

  buscarProximosVencimentos(): Promise<
    ServiceResult<ProximosVencimentosResponse[]>
  >;

  processarVencimentos(): Promise<
    ServiceResult<{
      expirados: number;
      pendentes: number;
    }>
  >;
  
}
