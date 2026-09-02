"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";

export interface ExpandedFavorite {
  id: number | string;
  user_id: number | string;
  restaurant_id?: number | string | null;
  menu_item_id?: number | string | null;
  type: "restaurant" | "shop" | "menu_item";
  created_at?: string;
  restaurant?: {
    id: number | string;
    name: string;
    type: "restaurant" | "shop";
    description?: string;
    cover_image_url?: string;
    profile_image_url?: string;
    address?: string;
    rating?: number;
    rating_count?: number;
    price_tier?: string;
    delivery_time_min?: number;
    delivery_time_max?: number;
    is_active?: boolean;
    cuisines?: { id: number | string; name: string }[];
  } | null;
  menu_item?: {
    id: number | string;
    name: string;
    description?: string;
    image_url?: string;
    base_price: number;
    is_available?: boolean;
    restaurant_id: number | string;
    restaurant_name?: string;
  } | null;
}

export function useFavoritesQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ExpandedFavorite[]>({
    queryKey: ["favorites"],
    queryFn: async (): Promise<ExpandedFavorite[]> => {
      try {
        const res = await apiClient.get<unknown>("/favorites");
        let rawList: Record<string, unknown>[] = [];

        if (Array.isArray(res)) {
          rawList = res as Record<string, unknown>[];
        } else if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          if (Array.isArray(obj.favorites)) rawList = obj.favorites as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];
        }

        return rawList.map((item) => {
          const isRestaurant = Boolean(item.restaurant_id || item.restaurant);
          const restObj = item.restaurant as Record<string, unknown> | null;
          const menuObj = item.menu_item as Record<string, unknown> | null;

          return {
            id: String(item.id),
            user_id: String(item.user_id),
            restaurant_id: item.restaurant_id ? String(item.restaurant_id) : null,
            menu_item_id: item.menu_item_id ? String(item.menu_item_id) : null,
            type: (item.type as "restaurant" | "shop" | "menu_item") || (isRestaurant ? "restaurant" : "menu_item"),
            created_at: String(item.created_at || ""),
            restaurant: restObj
              ? {
                  id: String(restObj.id),
                  name: String(restObj.name || "Restaurant"),
                  type: (restObj.type as "restaurant" | "shop") || "restaurant",
                  description: String(restObj.description || ""),
                  cover_image_url: String(restObj.cover_image_url || ""),
                  profile_image_url: String(restObj.profile_image_url || ""),
                  address: String(restObj.address || ""),
                  rating: Number(restObj.rating || 4.5),
                  rating_count: Number(restObj.rating_count || 0),
                  price_tier: String(restObj.price_tier || "$$"),
                  delivery_time_min: Number(restObj.delivery_time_min || 20),
                  delivery_time_max: Number(restObj.delivery_time_max || 35),
                  is_active: Boolean(restObj.is_active ?? true),
                  cuisines: Array.isArray(restObj.cuisines)
                    ? (restObj.cuisines as Record<string, unknown>[]).map((c) => ({
                        id: String(c.id),
                        name: String(c.name),
                      }))
                    : [],
                }
              : null,
            menu_item: menuObj
              ? {
                  id: String(menuObj.id),
                  name: String(menuObj.name || "Item"),
                  description: String(menuObj.description || ""),
                  image_url: String(menuObj.image_url || ""),
                  base_price: Number(menuObj.base_price || 0),
                  is_available: Boolean(menuObj.is_available ?? true),
                  restaurant_id: String(menuObj.restaurant_id || ""),
                  restaurant_name: String(menuObj.restaurant_name || "Restaurant"),
                }
              : null,
          };
        });
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useFavorite(
  entityType: "restaurant" | "shop" | "menu_item",
  entityId: string | number
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: favorites = [] } = useFavoritesQuery();

  const stringId = String(entityId);

  // Check if current item is favorited in cache
  const matchingFavorite = favorites.find((f) => {
    if (entityType === "restaurant" || entityType === "shop") {
      return String(f.restaurant_id) === stringId || (f.restaurant && String(f.restaurant.id) === stringId);
    }
    return String(f.menu_item_id) === stringId || (f.menu_item && String(f.menu_item.id) === stringId);
  });

  const isFavorite = Boolean(matchingFavorite);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite && matchingFavorite) {
        return apiClient.delete(`/favorites/${matchingFavorite.id}`);
      } else if (isFavorite && !matchingFavorite) {
        const queryParam = entityType === "menu_item" ? `menuItemId=${stringId}` : `restaurantId=${stringId}`;
        return apiClient.delete(`/favorites?${queryParam}`);
      } else {
        const body =
          entityType === "menu_item"
            ? { menuItemId: Number(stringId) }
            : { restaurantId: Number(stringId) };
        return apiClient.post("/favorites", body);
      }
    },
    onMutate: async () => {
      // Optimistically update favorites cache
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousFavorites = queryClient.getQueryData<ExpandedFavorite[]>(["favorites"]) || [];

      if (isFavorite && matchingFavorite) {
        queryClient.setQueryData<ExpandedFavorite[]>(
          ["favorites"],
          previousFavorites.filter((f) => f.id !== matchingFavorite.id)
        );
      } else if (!isFavorite) {
        const tempFav: ExpandedFavorite = {
          id: `temp_${Date.now()}`,
          user_id: "temp",
          restaurant_id: entityType !== "menu_item" ? stringId : null,
          menu_item_id: entityType === "menu_item" ? stringId : null,
          type: entityType,
        };
        queryClient.setQueryData<ExpandedFavorite[]>(["favorites"], [tempFav, ...previousFavorites]);
      }

      return { previousFavorites };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
      alert("Failed to update favorite status. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantMenu"] });
      queryClient.invalidateQueries({ queryKey: ["menuItem"] });
    },
  });

  const toggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=favorites");
      return;
    }

    if (!stringId || stringId === "undefined") return;

    toggleMutation.mutate();
  };

  return {
    isFavorite,
    favoriteId: matchingFavorite?.id,
    toggleFavorite,
    isLoading: toggleMutation.isPending,
  };
}
