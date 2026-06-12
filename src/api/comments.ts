import http from "./axios";
import type { ApiResult, PageResult, CommentVO, CommentCreateDTO } from "@/types";

export const commentsApi = {
  listByPost: (postId: number) =>
    http.get<ApiResult<CommentVO[]>>(`/posts/${postId}/comments`).then((r) => r.data.data),

  create: (dto: CommentCreateDTO) =>
    http.post<ApiResult<CommentVO>>("/comments", dto).then((r) => r.data.data),

  // Admin
  adminList: (params: {
    pageNum?: number;
    pageSize?: number;
    postId?: number;
    status?: number;
    keyword?: string;
  }) =>
    http.get<ApiResult<PageResult<CommentVO>>>("/admin/comments", { params }).then((r) => r.data.data),

  approve: (id: number) =>
    http.put<ApiResult<void>>(`/admin/comments/${id}/approve`).then((r) => r.data),

  reject: (id: number) =>
    http.put<ApiResult<void>>(`/admin/comments/${id}/reject`).then((r) => r.data),

  aiReview: (id: number) =>
    http.put<ApiResult<void>>(`/admin/comments/${id}/ai-review`).then((r) => r.data),

  delete: (id: number) =>
    http.delete<ApiResult<void>>(`/admin/comments/${id}`).then((r) => r.data),
};
