import { type ServiceResult } from "../utils/service-result";
import { type LoginResponse, type LoginDTO } from "../dtos/auth.dto";

export interface IAuthService {
  login(
    data: LoginDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<ServiceResult<LoginResponse>>;

}