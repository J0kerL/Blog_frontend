import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const http = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (data.code !== undefined && data.code !== 200) {
      toast.error(data.message || "请求失败");
      return Promise.reject(new Error(data.message));
    }
    return res;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        useAuthStore.getState().logout();
        toast.error("登录已过期，请重新登录");
        window.location.href = "/login";
      } else if (status === 403) {
        toast.error("无权限访问");
      } else {
        toast.error(data?.message || `请求失败 (${status})`);
      }
    } else {
      toast.error("网络连接失败");
    }
    return Promise.reject(error);
  }
);

export default http;
