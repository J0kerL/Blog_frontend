import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserVO } from "@/types";

interface AuthState {
  token: string | null;
  user: UserVO | null;
  loginTime: number | null;
  setAuth: (token: string, user: UserVO) => void;
  logout: () => void;
  updateUser: (user: Partial<UserVO>) => void;
  isAuthenticated: () => boolean;
}

// Token有效期：7天（毫秒）
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loginTime: null,
      setAuth: (token, user) => set({ token, user, loginTime: Date.now() }),
      logout: () => set({ token: null, user: null, loginTime: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      isAuthenticated: () => {
        const { token, loginTime } = get();
        if (!token || !loginTime) return false;
        // 检查token是否过期
        if (Date.now() - loginTime > TOKEN_MAX_AGE) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    { name: "blog-auth" }
  )
);
