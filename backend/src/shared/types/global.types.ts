export type PaginationQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export type StandardResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: { field: string; message: string }[];
};
