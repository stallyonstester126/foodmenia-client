import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PastOrder {
  id: string;
  restaurantName: string;
  restaurantImage?: string;
  status: string;
  createdAt: string;
  total: number;
  itemsCount: number;
  itemSummary: string;
}

export interface FavoriteItem {
  id: string;
  targetId: string;
  type: "restaurant" | "menu_item";
  name: string;
  image?: string;
  rating?: string;
  priceOrCuisine?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  discountType: "fixed" | "percent";
  minSpend: number;
  expiresAt: string;
  description: string;
}

// 1. Profile Hooks
export function useUserProfile() {
  const { user, isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: async (): Promise<UserProfile> => {
      const data = await apiClient.get<UserProfile>("/users/me");
      return data;
    },
    enabled: isAuthenticated,
    initialData: user ? { id: user.id, email: user.email, name: user.name, phone: user.phone } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: { name?: string; phone?: string; avatarUrl?: string }) => {
      return await apiClient.patch<Partial<UserProfile>>("/users/me", updated);
    },
    onSuccess: (updatedUser: Partial<UserProfile>) => {
      useAuthStore.getState().updateUser(updatedUser);
    },
  });

  return { ...query, updateProfile: updateMutation };
}

// 2. Past Orders Hook
export function usePastOrders() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["pastOrders"],
    queryFn: async (): Promise<PastOrder[]> => {
      const res = await apiClient.get<unknown>("/orders");
      let rawList: Record<string, unknown>[] = [];
      if (Array.isArray(res)) rawList = res as Record<string, unknown>[];
      else if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
        else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];
      }

      return rawList.map((item) => {
        const statusUpper = String(item.status || "PLACED").toUpperCase();
        const rawDate = item.placed_at || item.created_at || item.createdAt;
        const formattedDate = rawDate
          ? new Date(String(rawDate)).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently";

        return {
          id: String(item.id),
          restaurantName: String(item.restaurant_name || item.restaurantName || "Restaurant"),
          restaurantImage: String(item.restaurant_profile_image || item.restaurant_cover_image || item.restaurantImage || "/item1.png"),
          status: statusUpper,
          createdAt: formattedDate,
          total: Number(item.total ?? 0),
          itemsCount: Number(item.total_items ?? item.itemsCount ?? 1),
          itemSummary: String(item.summary_items || item.itemSummary || "Order items"),
        };
      });
    },
    enabled: isAuthenticated,
  });
}

export { useFavoritesQuery as useFavorites } from "@/lib/useFavorite";

// 4. Vouchers Hook
export function useVouchers() {
  return useQuery({
    queryKey: ["vouchers"],
    queryFn: async (): Promise<Voucher[]> => {
      try {
        const data = await apiClient.get<Voucher[]>("/vouchers");
        return data || [];
      } catch {
        // Fallback default available vouchers
        return [
          {
            id: "v1",
            code: "WELCOME10",
            discountAmount: 10,
            discountType: "percent",
            minSpend: 200,
            expiresAt: "2026-12-31",
            description: "Get 10% off on your first order!",
          },
          {
            id: "v2",
            code: "FOODMENIA50",
            discountAmount: 50,
            discountType: "fixed",
            minSpend: 500,
            expiresAt: "2026-12-31",
            description: "Flat Rs. 50 off on orders above Rs. 500.",
          },
        ];
      }
    },
  });
}
