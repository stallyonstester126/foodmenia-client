import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface Cuisine {
  id: string;
  name: string;
  image?: string;
  itemCount?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  isFreeDelivery?: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  image?: string;
  isFavorite?: boolean;
  type?: "restaurant" | "shop";
}

export interface MenuItemAddonOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemAddonGroup {
  id: string;
  title: string;
  isRequired: boolean;
  maxSelection?: number;
  options: MenuItemAddonOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isPopular?: boolean;
  addonGroups?: MenuItemAddonGroup[];
  frequentlyBoughtTogether?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
  }[];
}

type ApiArrayResponse<T> =
  | T[]
  | {
      data?: T[];
      cuisines?: T[];
      restaurants?: T[];
      items?: T[];
      menu?: T[];
    };

// 1. Fetch Cuisines
export function useCuisines() {
  return useQuery<Cuisine[]>({
    queryKey: ["cuisines"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiArrayResponse<Cuisine>>("/cuisines");
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.cuisines)) return res.cuisines;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      } catch {
        return [
          { id: "1", name: "Burgers", itemCount: 120, image: "/item1.png" },
          { id: "2", name: "Pizza", itemCount: 85, image: "/item2.png" },
          { id: "3", name: "Chinese", itemCount: 95, image: "/item3.png" },
          { id: "4", name: "Desi", itemCount: 110, image: "/item1.png" },
          { id: "5", name: "Desserts", itemCount: 60, image: "/item2.png" },
        ];
      }
    },
  });
}

// 2. Fetch Restaurants & Shops
export function useRestaurants(params?: {
  cuisine?: string;
  search?: string;
  sort?: string;
  type?: "restaurant" | "shop";
}) {
  const queryKey = [
    "restaurants",
    params?.cuisine || "",
    params?.search || "",
    params?.sort || "",
    params?.type || "",
  ];

  return useQuery<Restaurant[]>({
    queryKey,
    queryFn: async () => {
      try {
        const query = new URLSearchParams();
        if (params?.cuisine && params.cuisine !== "All") query.append("cuisine", params.cuisine);
        if (params?.search) query.append("search", params.search);
        if (params?.sort) query.append("sort", params.sort);
        if (params?.type) query.append("type", params.type);

        const qs = query.toString();
        const res = await apiClient.get<unknown>(`/restaurants${qs ? `?${qs}` : ""}`);

        interface ApiRestaurant {
          id: number | string;
          name: string;
          description?: string;
          profile_image_url?: string;
          profileImageUrl?: string;
          cover_image_url?: string;
          coverImageUrl?: string;
          image?: string;
          rating?: number | string;
          delivery_time_min?: number;
          delivery_time_max?: number;
          deliveryTime?: string;
          cuisines?: { id: number; name: string }[];
          cuisine?: string;
          type?: "restaurant" | "shop";
          isFavorite?: boolean;
        }

        let rawList: ApiRestaurant[] = [];
        if (Array.isArray(res)) {
          rawList = res as ApiRestaurant[];
        } else if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as ApiRestaurant[];
          else if (Array.isArray(obj.restaurants)) rawList = obj.restaurants as ApiRestaurant[];
          else if (Array.isArray(obj.data)) rawList = obj.data as ApiRestaurant[];
        }

        if (params?.type) {
          rawList = rawList.filter((r) => r.type === params.type);
        }

        return rawList.map((r) => ({
          id: String(r.id),
          name: r.name,
          cuisine:
            r.cuisines && r.cuisines.length > 0
              ? r.cuisines.map((c) => c.name).join(" · ")
              : r.cuisine || r.description || (r.type === "shop" ? "Grocery & Bakery" : "Fast Food"),
          rating: Number(r.rating || 4.5),
          deliveryTime:
            r.delivery_time_min && r.delivery_time_max
              ? `${r.delivery_time_min}-${r.delivery_time_max} mins`
              : r.deliveryTime || "20-35 mins",
          isFreeDelivery: true,
          profileImageUrl: r.profile_image_url || r.profileImageUrl || null,
          coverImageUrl: r.cover_image_url || r.coverImageUrl || null,
          image: r.profile_image_url || r.profileImageUrl || r.cover_image_url || r.coverImageUrl || r.image || (r.type === "shop" ? "/shophero.png" : "/ResturantHero.png"),
          type: r.type || "restaurant",
          isFavorite: r.isFavorite || false,
        }));
      } catch {
        if (params?.type === "shop") {
          return [
            {
              id: "shop_1",
              name: "FoodMenia Supermarket & Grocery",
              cuisine: "Grocery · Snacks · Beverages",
              rating: 4.9,
              deliveryTime: "15-25 mins",
              isFreeDelivery: true,
              image: "/shophero.png",
              type: "shop",
            },
            {
              id: "shop_2",
              name: "7-Eleven Convenience Store",
              cuisine: "Convenience · Bakery · Drinks",
              rating: 4.7,
              deliveryTime: "10-20 mins",
              isFreeDelivery: true,
              image: "/restaurant_seveneleven.png",
              type: "shop",
            },
          ];
        }

        return [
          {
            id: "rest_1",
            name: "Al Basit Restaurant",
            cuisine: "Asian · Chinese · Bar B Q",
            rating: 4.8,
            deliveryTime: "20-35 mins",
            isFreeDelivery: true,
            image: "/ResturantHero.png",
            type: "restaurant",
          },
          {
            id: "rest_2",
            name: "Chowking",
            cuisine: "Chinese · Fast Food",
            rating: 4.6,
            deliveryTime: "15-25 mins",
            isFreeDelivery: false,
            image: "/card2.png",
            type: "restaurant",
          },
        ];
      }
    },
  });
}

// 3. Fetch Single Restaurant Detail
export function useRestaurantDetail(id: string) {
  return useQuery<Restaurant>({
    queryKey: ["restaurant", id],
    queryFn: async (): Promise<Restaurant> => {
      try {
        const res = await apiClient.get<Record<string, unknown>>(`/restaurants/${id}`);
        if (!res) throw new Error("Restaurant not found");

        const coverImageUrl = (res.cover_image_url || res.coverImageUrl || "") as string;
        const profileImageUrl = (res.profile_image_url || res.profileImageUrl || "") as string;

        return {
          id: String(res.id || id),
          name: String(res.name || "Al Basit Restaurant"),
          cuisine:
            Array.isArray(res.cuisines) && res.cuisines.length > 0
              ? (res.cuisines as { name: string }[]).map((c) => c.name).join(" · ")
              : String(res.cuisine || res.description || "Fast Food"),
          rating: Number(res.rating || 4.8),
          deliveryTime:
            res.delivery_time_min && res.delivery_time_max
              ? `${res.delivery_time_min}-${res.delivery_time_max} mins`
              : String(res.deliveryTime || "20-35 mins"),
          isFreeDelivery: true,
          profileImageUrl: profileImageUrl || null,
          coverImageUrl: coverImageUrl || null,
          image: coverImageUrl || profileImageUrl || String(res.image || "/ResturantHero.png"),
        };
      } catch {
        return {
          id: id || "1",
          name: "Al Basit Restaurant",
          cuisine: "Asian · Chinese · Bar B Q",
          rating: 4.8,
          deliveryTime: "20-35 mins",
          isFreeDelivery: true,
          image: "/ResturantHero.png",
        };
      }
    },
    enabled: !!id,
  });
}

// 4. Fetch Restaurant Menu Items
export function useRestaurantMenu(restaurantId: string, category?: string) {
  return useQuery<MenuItem[]>({
    queryKey: ["restaurantMenu", restaurantId, category || "Popular"],
    queryFn: async () => {
      try {
        const query = category && category !== "Popular" ? `?category=${encodeURIComponent(category)}` : "";
        const res = await apiClient.get<unknown>(`/restaurants/${restaurantId}/menu${query}`);
        let rawList: Record<string, unknown>[] = [];
        if (Array.isArray(res)) rawList = res as Record<string, unknown>[];
        else if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.menu)) rawList = obj.menu as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];
        }

        return rawList.map((item) => ({
          id: String(item.id),
          restaurantId: String(item.restaurant_id || item.restaurantId || restaurantId),
          name: String(item.name || ""),
          description: String(item.description || ""),
          price: Number(item.base_price ?? item.price ?? 0),
          image: String(item.image_url || item.image || "/item1.png"),
          category: String(item.category_name || item.category || "Popular"),
          isPopular: Boolean(item.isPopular ?? true),
        }));
      } catch {
        return [
          { id: "item_1", restaurantId, name: "Leg Tikka", description: "Juicy grilled chicken leg tikka piece", price: 430, category: "Popular", image: "/item1.png", isPopular: true },
          { id: "item_2", restaurantId, name: "Breast Tikka", description: "Flame grilled chicken breast tikka", price: 480, category: "Popular", image: "/item2.png", isPopular: true },
          { id: "item_3", restaurantId, name: "Jumbo Zinger Burger", description: "Crispy chicken patty with lettuce and sauce", price: 720, category: "Burgers", image: "/item3.png", isPopular: true },
          { id: "item_4", restaurantId, name: "Beef Burger", description: "Juicy beef patty burger with cheese", price: 650, category: "Burgers", image: "/item1.png" },
        ];
      }
    },
    enabled: !!restaurantId,
    placeholderData: (previousData) => previousData,
  });
}

// 5. Fetch Single Menu Item Detail
export function useMenuItemDetail(itemId: string) {
  return useQuery<MenuItem>({
    queryKey: ["menuItem", itemId],
    queryFn: async () => {
      try {
        const res = await apiClient.get<Record<string, unknown>>(`/menu-items/${itemId}`);
        if (!res) throw new Error("Item not found");

        const addonGroups = Array.isArray(res.addon_groups)
          ? (res.addon_groups as Record<string, unknown>[]).map((g) => ({
              id: String(g.id || ""),
              title: String(g.name || g.title || ""),
              isRequired: Boolean(g.is_required || g.isRequired),
              options: Array.isArray(g.options)
                ? (g.options as Record<string, unknown>[]).map((o) => ({
                    id: String(o.id || ""),
                    name: String(o.name || ""),
                    price: Number(o.extra_price ?? o.price ?? 0),
                  }))
                : [],
            }))
          : [];

        const frequentlyBoughtTogether = Array.isArray(res.frequently_bought_together)
          ? (res.frequently_bought_together as Record<string, unknown>[]).map((f) => ({
              id: String(f.id || ""),
              name: String(f.name || ""),
              description: String(f.description || ""),
              price: Number(f.base_price ?? f.price ?? 0),
              image: String(f.image_url || f.image || "/item3.png"),
            }))
          : [];

        return {
          id: String(res.id || itemId),
          restaurantId: String(res.restaurant_id || "rest_1"),
          name: String(res.name || "Menu Item"),
          description: String(res.description || ""),
          price: Number(res.base_price ?? res.price ?? 0),
          image: String(res.image_url || res.image || "/item3.png"),
          category: String(res.category_name || res.category || "Burgers"),
          addonGroups,
          frequentlyBoughtTogether,
        };
      } catch {
        return {
          id: itemId || "item_3",
          restaurantId: "rest_1",
          name: "JUMBO ZINGER BURGER",
          description: "Juicy double zinger chicken patty topped with melted cheese, lettuce, and secret garlic mayo sauce.",
          price: 720,
          image: "/item3.png",
          category: "Burgers",
          addonGroups: [
            {
              id: "g1",
              title: "Frequently Bought Together",
              isRequired: false,
              options: [
                { id: "o1", name: "Fries", price: 150 },
                { id: "o2", name: "Coleslaw", price: 100 },
              ],
            },
            {
              id: "g2",
              title: "Add a Cheese Slice",
              isRequired: false,
              options: [{ id: "o3", name: "1 Slice", price: 60 }],
            },
          ],
        };
      }
    },
    enabled: !!itemId,
  });
}

// 6. Toggle Favorite Mutation
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      isFavorite,
      type,
    }: {
      id: string;
      isFavorite: boolean;
      type: "restaurant" | "menu_item";
    }) => {
      if (isFavorite) {
        return await apiClient.delete(`/favorites/${id}`);
      } else {
        return await apiClient.post("/favorites", { targetId: id, type });
      }
    },
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["restaurants"] });
      const previousRestaurants = queryClient.getQueryData<Restaurant[]>(["restaurants"]);

      if (previousRestaurants) {
        queryClient.setQueryData<Restaurant[]>(
          ["restaurants"],
          previousRestaurants.map((r) => (r.id === id ? { ...r, isFavorite: !isFavorite } : r))
        );
      }

      return { previousRestaurants };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRestaurants) {
        queryClient.setQueryData(["restaurants"], context.previousRestaurants);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return (
    e: React.MouseEvent | { id: string; isFavorite: boolean; type: "restaurant" | "menu_item" },
    id?: string,
    isFavorite?: boolean,
    type: "restaurant" | "menu_item" = "restaurant"
  ) => {
    if (typeof e === "object" && "id" in e) {
      mutation.mutate(e);
    } else if (id) {
      e.preventDefault();
      e.stopPropagation();
      mutation.mutate({ id, isFavorite: !!isFavorite, type });
    }
  };
}
