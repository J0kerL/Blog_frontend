import http from "./axios";
import type { ApiResult, CategoryVO, CategoryDTO } from "@/types";

export const categoriesApi = {
  list: () =>
    http.get<ApiResult<CategoryVO[]>>("/categories").then((r) => r.data.data),

  // Admin
  adminList: () =>
    http.get<ApiResult<CategoryVO[]>>("/admin/categories").then((r) => r.data.data),

  adminSearch: (keyword: string) =>
    http.get<ApiResult<CategoryVO[]>>(`/admin/categories/search`, { params: { keyword } }).then((r) => r.data.data),

  create: (dto: CategoryDTO) =>
    http.post<ApiResult<CategoryVO>>("/admin/categories", dto).then((r) => r.data.data),

  update: (id: number, dto: CategoryDTO) =>
    http.put<ApiResult<CategoryVO>>(`/admin/categories/${id}`, dto).then((r) => r.data.data),

  delete: (id: number) =>
    http.delete<ApiResult<void>>(`/admin/categories/${id}`).then((r) => r.data),
};
