import http from "./axios";
import type { ApiResult, UserVO, UserUpdateDTO, ChangePasswordDTO, AdminUserVO, PageResult } from "@/types";

export const userApi = {
  getProfile: () =>
    http.get<ApiResult<UserVO>>("/user/profile").then((r) => r.data.data),

  updateProfile: (dto: UserUpdateDTO) =>
    http.put<ApiResult<UserVO>>("/user/profile", dto).then((r) => r.data.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<ApiResult<string>>("/user/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data);
  },

  changePassword: (dto: ChangePasswordDTO) =>
    http.post<ApiResult<void>>("/user/change-password", dto).then((r) => r.data),

  logout: () =>
    http.post<ApiResult<void>>("/user/logout").then((r) => r.data),

  // Admin
  adminList: (params: {
    pageNum?: number;
    pageSize?: number;
    keyword?: string;
    role?: string;
    status?: number;
  }) =>
    http.get<ApiResult<PageResult<AdminUserVO>>>("/admin/users", { params }).then((r) => r.data.data),

  adminUpdateStatus: (id: number, status: number) =>
    http.put<ApiResult<void>>(`/admin/users/${id}/status`, null, { params: { status } }).then((r) => r.data),

  adminUpdateRole: (id: number, role: string) =>
    http.put<ApiResult<void>>(`/admin/users/${id}/role`, null, { params: { role } }).then((r) => r.data),
};
