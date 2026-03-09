import { type ServiceResult } from "../utils/service-result";

import { type DashboardResponse } from "../dtos/dashboard.dto";

export interface IDashboardService {
  buscarEstatisticas(): Promise<ServiceResult<DashboardResponse>>;

}