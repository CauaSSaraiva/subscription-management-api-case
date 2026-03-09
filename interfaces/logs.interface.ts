import { type ServiceResult } from "../utils/service-result";
import { type LogsResponse, type ListLogsDTO } from "../dtos/logs.dto";

export interface ILogsService {
  listar(params: ListLogsDTO): Promise<ServiceResult<LogsResponse[]>>;

  
}