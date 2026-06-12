import http from "./axios";
import type { ApiResult } from "@/types";

export const uploadApi = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post<ApiResult<string>>("/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data);
  },
};
