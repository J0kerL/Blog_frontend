import http from "./axios";
import type { ApiResult, PageResult, PostListVO, PostVO, PostCreateDTO } from "@/types";

export const postsApi = {
  list: (params: {
    pageNum?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: number;
    tagId?: number;
  }) =>
    http.get<ApiResult<PageResult<PostListVO>>>("/posts", { params }).then((r) => r.data.data),

  getById: (id: number) =>
    http.get<ApiResult<PostVO>>(`/posts/${id}`).then((r) => r.data.data),

  getBySlug: (slug: string) =>
    http.get<ApiResult<PostVO>>(`/posts/slug/${slug}`).then((r) => r.data.data),

  // Admin
  adminList: (params: {
    pageNum?: number;
    pageSize?: number;
    keyword?: string;
    status?: number;
    categoryId?: number;
  }) =>
    http.get<ApiResult<PageResult<PostListVO>>>("/admin/posts", { params }).then((r) => r.data.data),

  adminGetById: (id: number) =>
    http.get<ApiResult<PostVO>>(`/admin/posts/${id}`).then((r) => r.data.data),

  create: (dto: PostCreateDTO) =>
    http.post<ApiResult<PostVO>>("/admin/posts", dto).then((r) => r.data.data),

  update: (id: number, dto: PostCreateDTO) =>
    http.put<ApiResult<PostVO>>(`/admin/posts/${id}`, dto).then((r) => r.data.data),

  updateStatus: (id: number, status: number) =>
    http.patch<ApiResult<PostVO>>(`/admin/posts/${id}/status`, { status }).then((r) => r.data.data),

  delete: (id: number) =>
    http.delete<ApiResult<void>>(`/admin/posts/${id}`).then((r) => r.data),
};
