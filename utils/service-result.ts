export type ServiceError = {
  message: string;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ServiceResult<T> =
  | { ok: true; data: T; meta?: PaginationMeta }
  | { ok: false; error: ServiceError; statusCode: number };
