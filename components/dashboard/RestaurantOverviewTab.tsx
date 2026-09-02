"use client";

import Image from "next/image";

interface RestaurantOverviewTabProps {
  restaurant: {
    id: number;
    name: string;
    description?: string;
    profile_image_url?: string;
    cover_image_url?: string;
    address?: string;
    is_active: boolean;
    price_tier?: string;
    rating?: number;
    type?: "restaurant" | "shop";
    rating_count?: number;
    cuisines?: { id: number; name: string }[];
  };
  menuItemsCount: number;
  ordersCount: number;
  onNavigateTab?: (tab: "menu" | "orders" | "settings") => void;
}

export default function RestaurantOverviewTab({
  restaurant,
  menuItemsCount,
  ordersCount,
  onNavigateTab,
}: RestaurantOverviewTabProps) {
  const isShop = restaurant.type === "shop";

  // Filter out any leftover malformed cuisines like Fav Cuisine 1788...
  const validCuisines = (restaurant.cuisines || []).filter(
    (c) => c.name && !c.name.startsWith("Fav Cuisine") && !c.name.match(/\d{10,}/)
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Rich Restaurant Identity Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Cover Background Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-[#2B1B0E] via-[#3a2514] to-[#2B1B0E]">
          {restaurant.cover_image_url && !restaurant.cover_image_url.includes("placeholder") ? (
            <Image
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              fill
              className="object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#FCBA08_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          )}

          {/* Top Status & Vendor Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-poppins font-bold bg-black/60 backdrop-blur-md text-[#FCBA08] border border-white/20 shadow-xs">
              {isShop ? "🛒 Shop / Grocery" : "🍔 Restaurant"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-poppins font-bold uppercase tracking-wider shadow-xs ${
                restaurant.is_active
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-amber-950"
              }`}
            >
              {restaurant.is_active ? "● Live & Active" : "⏳ Pending Review"}
            </span>
          </div>
        </div>

        {/* Profile Info Header Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-12 z-10">
            {/* Restaurant Logo / Avatar Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-[#FCBA08] shadow-md relative overflow-hidden flex items-center justify-center text-3xl font-extrabold text-[#2B1B0E] flex-shrink-0">
              {restaurant.profile_image_url && !restaurant.profile_image_url.includes("placeholder") ? (
                <Image
                  src={restaurant.profile_image_url}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{restaurant.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex flex-col pb-1">
              <h2 className="font-mali text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight">
                {restaurant.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {restaurant.address && (
                  <span className="font-poppins text-xs text-gray-500 font-medium flex items-center gap-1">
                    📍 {restaurant.address}
                  </span>
                )}
                {restaurant.price_tier && (
                  <span className="font-mono text-xs font-bold text-[#2B1B0E] bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                    {restaurant.price_tier}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <span className="font-poppins font-bold text-xs text-gray-500 uppercase tracking-wider">
          ⚡ Quick Management Shortcuts
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.("menu")}
            className="px-4 py-2 rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span>Add Menu Item</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("orders")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#2B1B0E] border border-gray-200 font-poppins font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>📦</span>
            <span>View Live Orders</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("settings")}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-poppins font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚙️</span>
            <span>Edit Profile Settings</span>
          </button>
        </div>
      </div>

      {/* 3. Cohesive Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Store Visibility
            </span>
            <span
              className={`font-poppins font-extrabold text-xl mt-1 ${
                restaurant.is_active ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {restaurant.is_active ? "Live & Public" : "Under Review"}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
              restaurant.is_active
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}
          >
            {restaurant.is_active ? "✅" : "⏳"}
          </div>
        </div>

        {/* Menu Items Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isShop ? "Catalog Products" : "Active Menu Items"}
            </span>
            <span className="font-poppins font-extrabold text-2xl text-[#1A1A1A] mt-1">
              {menuItemsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#2B1B0E] border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
            {isShop ? "🛒" : "🍔"}
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Processed Orders
            </span>
            <span className="font-poppins font-extrabold text-2xl text-[#1A1A1A] mt-1">
              {ordersCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#2B1B0E] border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
            📦
          </div>
        </div>
      </div>

      {/* 4. Structured Profile Summary & Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-poppins font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            📄 {isShop ? "Shop Identity & Details" : "Restaurant Profile Details"}
          </h3>

          <button
            type="button"
            onClick={() => onNavigateTab?.("settings")}
            className="text-xs font-poppins font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Edit Info →
          </button>
        </div>

        {/* Description Prompt Box */}
        {restaurant.description ? (
          <p className="font-poppins text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            {restaurant.description}
          </p>
        ) : (
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">💡</span>
              <div className="flex flex-col">
                <span className="font-poppins font-bold text-xs text-amber-950">
                  No description added yet
                </span>
                <span className="font-poppins text-xs text-amber-800">
                  Adding a short description helps customer discovery in search and menu listings.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.("settings")}
              className="px-3 py-1.5 rounded-lg bg-[#2B1B0E] text-[#FCBA08] text-xs font-poppins font-bold shrink-0"
            >
              Add Now
            </button>
          </div>
        )}

        {/* Structured Label / Value Key-Value Pairs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Physical Location
            </span>
            <span className="font-poppins text-sm font-semibold text-[#1A1A1A]">
              {restaurant.address || "No address specified"}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Price Rating
            </span>
            <span className="font-poppins text-sm font-semibold text-[#1A1A1A]">
              {restaurant.price_tier || "$$"}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Category
            </span>
            <span className="font-poppins text-sm font-semibold text-[#1A1A1A] capitalize">
              {isShop ? "Shop / Retail Grocery" : "Dining & Food Outlet"}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isShop ? "Offered Product Tags" : "Cuisines Served"}
            </span>
            {validCuisines.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {validCuisines.map((c) => (
                  <span
                    key={c.id}
                    className="bg-[#2B1B0E] text-[#FCBA08] text-[11px] font-poppins font-bold px-2.5 py-0.5 rounded-full"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-poppins text-sm font-semibold text-gray-400">
                None selected yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
