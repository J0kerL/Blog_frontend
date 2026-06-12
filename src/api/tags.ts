import http from "./axios";
import type { ApiResult, TagVO, TagDTO } from "@/types";

export const tagsApi = {
  list: () =>
    http.get<ApiResult<TagVO[]>>("/tags").then((r) => r.data.data),

  // Admin
  adminList: () =>
    http.get<ApiResult<TagVO[]>>("/admin/tags").then((r) => r.data.data),

  adminSearch: (keyword: string) =>
    http.get<ApiResult<TagVO[]>>(`/admin/tags/search`, { params: { keyword } }).then((r) => r.data.data),

  create: (dto: TagDTO) =>
    http.post<ApiResult<TagVO>>("/admin/tags", dto).then((r) => r.data.data),

  update: (id: number, dto: TagDTO) =>
    http.put<ApiResult<TagVO>>(`/admin/tags/${id}`, dto).then((r) => r.data.data),

  delete: (id: number) =>
    http.delete<ApiResult<void>>(`/admin/tags/${id}`).then((r) => r.data),
};
