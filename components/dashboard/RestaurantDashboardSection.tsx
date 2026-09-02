"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import RestaurantOverviewTab from "./RestaurantOverviewTab";
import RestaurantMenuTab from "./RestaurantMenuTab";
import RestaurantOrdersTab from "./RestaurantOrdersTab";
import RestaurantSettingsTab from "./RestaurantSettingsTab";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

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
  type?: "restaurant" | "shop";
  cuisines?: Cuisine[];
}

interface RestaurantDashboardSectionProps {
  restaurant: Restaurant;
  cuisines: Cuisine[];
}

export default function RestaurantDashboardSection({
  restaurant,
  cuisines,
}: RestaurantDashboardSectionProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "orders" | "settings">("overview");

  // Fetch items count and orders count for overview metrics
  const { data: menuItems = [] } = useQuery<{ id: number }[]>({
    queryKey: ["owner-items"],
    queryFn: () => apiClient.get<{ id: number }[]>("/restaurant-owner/menu-items"),
  });

  const { data: orders = [] } = useQuery<{ id: number }[]>({
    queryKey: ["owner-orders"],
    queryFn: () => apiClient.get<{ id: number }[]>("/restaurant-owner/orders"),
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between select-none">
      {/* Header & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 relative z-50">
        <Navbar activeTab="restaurant" />
      </div>

      {/* Persistent Approval Status Banner */}
      {!restaurant.is_active && (
        <div className="w-full bg-amber-500 text-amber-950 px-6 py-2.5 text-center font-poppins text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner">
          <span>⏳</span>
          <span>
            <strong>Pending Admin Approval:</strong> Your {restaurant.type === "shop" ? "shop" : "restaurant"} is registered but not publicly visible to customers until approved.
          </span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 flex flex-col gap-6">
        {/* Top Header & Horizontal Nav Tabs Container */}
        <div className="flex flex-col gap-5">
          {/* Dashboard Header Text */}
          <div>
            <h1 className="font-mali uppercase text-[28px] sm:text-[34px] font-bold text-[#2B1B0E]">
              {restaurant.type === "shop" ? "SHOP OWNER DASHBOARD" : "RESTAURANT OWNER DASHBOARD"}
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 mt-0.5">
              Managing <strong className="text-gray-900">{restaurant.name}</strong>
            </p>
          </div>

          {/* Horizontal Navigation Tab Bar */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-2 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center justify-center gap-2.5 px-3 sm:px-5 py-3 rounded-xl font-poppins text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer w-full text-center ${
                activeTab === "overview"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs font-bold"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
              }`}
            >
              <span>📊</span>
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`flex items-center justify-center gap-2.5 px-3 sm:px-5 py-3 rounded-xl font-poppins text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer w-full text-center ${
                activeTab === "menu"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs font-bold"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
              }`}
            >
              <span>{restaurant.type === "shop" ? "🛒" : "🍔"}</span>
              <span>{restaurant.type === "shop" ? "Products & Inventory" : "Menu Management"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-center gap-2.5 px-3 sm:px-5 py-3 rounded-xl font-poppins text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer w-full text-center ${
                activeTab === "orders"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs font-bold"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
              }`}
            >
              <span>📦</span>
              <span>Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center justify-center gap-2.5 px-3 sm:px-5 py-3 rounded-xl font-poppins text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer w-full text-center ${
                activeTab === "settings"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs font-bold"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
              }`}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area (Full Width) */}
        <div className="w-full">
          {activeTab === "overview" && (
            <RestaurantOverviewTab
              restaurant={restaurant}
              menuItemsCount={menuItems.length}
              ordersCount={orders.length}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === "menu" && <RestaurantMenuTab isShop={restaurant.type === "shop"} />}
          {activeTab === "orders" && <RestaurantOrdersTab restaurantId={restaurant.id} />}
          {activeTab === "settings" && (
            <RestaurantSettingsTab restaurant={restaurant} cuisines={cuisines} />
          )}
        </div>
      </main>
    </div>
  );
}
