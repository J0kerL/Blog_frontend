import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const http = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// 不需要token的白名单路径
const WHITE_LIST = ["/auth/login", "/auth/register", "/auth/captcha", "/auth/forgot-password"];

http.interceptors.request.use((config) => {
  const { token, isAuthenticated } = useAuthStore.getState();
  
  // 检查token有效性
  if (token && !isAuthenticated()) {
    // token已过期，清除登录状态并跳转到登录页
    useAuthStore.getState().logout();
    window.location.href = "/login";
    return Promise.reject(new Error("登录已过期，请重新登录"));
  }
  
  // 白名单路径不添加token
  const isWhiteListed = WHITE_LIST.some(path => config.url?.startsWith(path));
  if (token && !isWhiteListed) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

http.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (data.code !== undefined && data.code !== 200) {
      // 根据业务错误码进行更细致的处理
      const errorMessage = data.message || "请求失败";
      toast.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    return res;
  },
  (error) => {
    // 请求被取消时不显示错误
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message;
      
      switch (status) {
        case 401:
          useAuthStore.getState().logout();
          toast.error("登录已过期，请重新登录");
          window.location.href = "/login";
          break;
        case 403:
          toast.error("无权限访问");
          break;
        case 404:
          toast.error("请求的资源不存在");
          break;
        case 429:
          toast.error("请求过于频繁，请稍后再试");
          break;
        case 500:
          toast.error("服务器内部错误");
          break;
        default:
          toast.error(message || `请求失败 (${status})`);
      }
    } else if (error.code === "ECONNABORTED") {
      toast.error("请求超时，请检查网络连接");
    } else if (!window.navigator.onLine) {
      toast.error("网络连接已断开");
    } else if (error.message === "登录已过期，请重新登录") {
      // token过期的错误，已经在拦截器中处理，不重复提示
    } else {
      toast.error("网络连接失败，请检查后端服务是否启动");
    }
    
    return Promise.reject(error);
  }
);

// 创建可取消请求的工具函数
export function createCancelToken() {
  const controller = new AbortController();
  return {
    token: controller.signal,
    cancel: () => controller.abort("请求已取消"),
  };
}

export default http;
