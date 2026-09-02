"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/authStore";
import { apiClient } from "@/lib/apiClient";
import RestaurantOnboardingSection from "@/components/dashboard/RestaurantOnboardingSection";
import RestaurantDashboardSection from "@/components/dashboard/RestaurantDashboardSection";

interface Cuisine {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  address?: string;
  is_active: boolean;
  price_tier?: string;
  cuisines?: Cuisine[];
}

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();

  const isVendorRole =
    user?.role === "restaurant_owner" ||
    user?.role === "shop_owner" ||
    user?.role === "vendor";

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/restaurant-dashboard");
      } else if (!isVendorRole) {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, authLoading, router, isVendorRole]);

  // Fetch Owner Restaurant/Shop Profile
  const {
    data: restaurant,
    isLoading: restaurantLoading,
    isError,
    refetch,
  } = useQuery<Restaurant | null>({
    queryKey: ["owner-restaurant"],
    queryFn: async () => {
      try {
        return await apiClient.get<Restaurant>("/restaurant-owner/restaurant");
      } catch (err: unknown) {
        const errorObj = err as { status?: number };
        if (errorObj?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: isAuthenticated && isVendorRole,
  });

  // Fetch Available Cuisines / Categories
  const { data: cuisines = [] } = useQuery<Cuisine[]>({
    queryKey: ["cuisines"],
    queryFn: () => apiClient.get<Cuisine[]>("/cuisines"),
  });

  // Fetch Items & Orders for overview metrics to prevent staggered navbar loading
  const { isLoading: itemsLoading } = useQuery<{ id: number }[]>({
    queryKey: ["owner-items"],
    queryFn: () => apiClient.get<{ id: number }[]>("/restaurant-owner/menu-items"),
    enabled: isAuthenticated && isVendorRole && Boolean(restaurant),
  });

  const { isLoading: ordersLoading } = useQuery<{ id: number }[]>({
    queryKey: ["owner-orders"],
    queryFn: () => apiClient.get<{ id: number }[]>("/restaurant-owner/orders"),
    enabled: isAuthenticated && isVendorRole && Boolean(restaurant),
  });

  const isFullPageLoading =
    authLoading ||
    (isAuthenticated &&
      isVendorRole &&
      (restaurantLoading || itemsLoading || ordersLoading));

  if (isFullPageLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center select-none">
        <div className="w-10 h-10 border-4 border-[#FCBA08] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-poppins text-sm text-gray-500 font-medium">
          Loading Dashboard...
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !isVendorRole) {
    return null; // Redirecting...
  }

  // If no restaurant exists yet or 404, show onboarding flow
  if (!restaurant || isError) {
    return (
      <RestaurantOnboardingSection
        onSuccess={() => refetch()}
        cuisines={cuisines}
      />
    );
  }

  // If restaurant exists, show main dashboard
  return (
    <RestaurantDashboardSection
      restaurant={restaurant}
      cuisines={cuisines}
    />
  );
}
