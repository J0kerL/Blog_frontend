import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserVO } from "@/types";

interface AuthState {
  token: string | null;
  user: UserVO | null;
  setAuth: (token: string, user: UserVO) => void;
  logout: () => void;
  updateUser: (user: Partial<UserVO>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    { name: "blog-auth" }
  )
);
