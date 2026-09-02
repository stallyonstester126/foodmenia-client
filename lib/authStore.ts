import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: "customer" | "restaurant_owner" | "shop_owner" | "vendor" | "admin";
  hasRestaurant?: boolean;
  hasShop?: boolean;
  email_verified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({
      user,
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
    if (typeof window !== "undefined") {
      import("./cartStore").then(({ useCartStore }) => {
        useCartStore.getState().syncGuestCart();
      });
    }
  },

  updateUser: (partialUser) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const user = { ...currentUser, ...partialUser };
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore API error on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("guest_cart");
        import("./cartStore").then(({ useCartStore }) => {
          useCartStore.setState({ cart: null });
        });
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logoutAll: async () => {
    try {
      await apiClient.post("/auth/logout-all");
    } catch {
      // Ignore API error on logout-all
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("guest_cart");
        import("./cartStore").then(({ useCartStore }) => {
          useCartStore.setState({ cart: null });
        });
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initializeAuth: () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch {
        // Bad JSON in localStorage
      }
    }
    set({ isLoading: false });
  },
}));
