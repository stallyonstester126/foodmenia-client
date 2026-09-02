"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ImageUpload";
import { apiClient } from "@/lib/apiClient";

const AddressMapPicker = dynamic(() => import("@/components/map/AddressMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center font-poppins text-xs text-gray-500 gap-2">
      <div className="w-6 h-6 border-2 border-[#FCBA08] border-t-transparent rounded-full animate-spin" />
      <span>Loading interactive store location map...</span>
    </div>
  ),
});

interface Cuisine {
  id: number;
  name: string;
}

interface RestaurantSettingsTabProps {
  restaurant: {
    id: number;
    name: string;
    description?: string;
    profile_image_url?: string;
    cover_image_url?: string;
    address?: string;
    lat?: number;
    lng?: number;
    currency?: string;
    is_active: boolean;
    price_tier?: string;
    type?: "restaurant" | "shop";
    cuisines?: { id: number; name: string }[];
  };
  cuisines: Cuisine[];
}

const POPULAR_CURRENCIES = [
  "USD ($)",
  "EUR (€)",
  "GBP (£)",
  "PKR (Rs.)",
  "INR (₹)",
  "CAD ($)",
  "AUD ($)",
  "AED (AED)",
  "SAR (SR)",
  "JPY (¥)",
];

export default function RestaurantSettingsTab({
  restaurant,
  cuisines,
}: RestaurantSettingsTabProps) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<"restaurant" | "shop">(restaurant.type || "restaurant");
  const [name, setName] = useState(restaurant.name || "");
  const [description, setDescription] = useState(restaurant.description || "");
  const [profileImageUrl, setProfileImageUrl] = useState(restaurant.profile_image_url || "");
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant.cover_image_url || "");
  const [address, setAddress] = useState(restaurant.address || "");
  const [lat, setLat] = useState<number | undefined>(restaurant.lat ? Number(restaurant.lat) : undefined);
  const [lng, setLng] = useState<number | undefined>(restaurant.lng ? Number(restaurant.lng) : undefined);
  
  // Currency state
  const initialCurrency = restaurant.currency || "USD ($)";
  const isPredefined = POPULAR_CURRENCIES.includes(initialCurrency);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(isPredefined ? initialCurrency : "CUSTOM");
  const [customCurrency, setCustomCurrency] = useState<string>(isPredefined ? "" : initialCurrency);

  const [selectedCuisineIds, setSelectedCuisineIds] = useState<number[]>(
    restaurant.cuisines ? restaurant.cuisines.map((c) => c.id) : []
  );

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleCuisine = (id: number) => {
    setSelectedCuisineIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const activeCurrencyValue =
    selectedCurrency === "CUSTOM" ? customCurrency || "USD ($)" : selectedCurrency;

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.patch("/restaurant-owner/restaurant", {
        name,
        description,
        type,
        profileImageUrl,
        coverImageUrl,
        address,
        lat,
        lng,
        currency: activeCurrencyValue,
        cuisineIds: selectedCuisineIds,
      }),
    onSuccess: () => {
      setSuccessMsg("Venue profile, map location, and currency settings updated successfully!");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["owner-restaurant"] });
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile.");
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Approval Status Card */}
      <div
        className={`w-full rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          restaurant.is_active
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{restaurant.is_active ? "✅" : "⏳"}</span>
          <div>
            <h4 className="font-poppins font-bold text-sm">
              {restaurant.is_active
                ? `${type === "shop" ? "Shop" : "Restaurant"} is Live & Publicly Active`
                : `${type === "shop" ? "Shop" : "Restaurant"} Pending Admin Approval`}
            </h4>
            <p className="font-poppins text-xs opacity-90 mt-0.5 max-w-xl">
              {restaurant.is_active
                ? `Your ${type === "shop" ? "shop" : "restaurant"} is active and visible to all customers on FoodMenia.`
                : `Your ${type === "shop" ? "shop" : "restaurant"} application is under review. It will become visible in public search and listings once an administrator flips its status to active.`}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-poppins font-bold uppercase tracking-wider flex-shrink-0 self-start sm:self-auto ${
            restaurant.is_active
              ? "bg-emerald-600 text-white"
              : "bg-amber-500 text-amber-950"
          }`}
        >
          {restaurant.is_active ? "Active" : "Pending Approval"}
        </span>
      </div>

      {/* Settings Form Sectioned into 4 Cards */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="flex flex-col gap-6"
      >
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-poppins font-medium">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-poppins font-medium">
            {errorMsg}
          </div>
        )}

        {/* SECTION 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-bold text-base text-[#1A1A1A] flex items-center gap-2">
              📌 Basic Information
            </h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-poppins font-bold bg-[#2B1B0E] text-[#FCBA08]">
              {type === "shop" ? "🛒 Shop / Grocery" : "🍔 Restaurant"}
            </span>
          </div>

          {/* Vendor Type Pill Selector */}
          <div className="flex flex-col gap-2 p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider">
                Vendor Type Selection
              </label>
              {restaurant.is_active && (
                <span className="font-poppins text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                  🔒 Locked (Approved Venue)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={restaurant.is_active}
                onClick={() => setType("restaurant")}
                className={`py-2.5 px-4 rounded-xl font-poppins font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  restaurant.is_active
                    ? type === "restaurant"
                      ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] cursor-not-allowed opacity-90 shadow-2xs"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                    : type === "restaurant"
                    ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] shadow-xs cursor-pointer"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                <span>🍔</span>
                <span>Restaurant</span>
              </button>

              <button
                type="button"
                disabled={restaurant.is_active}
                onClick={() => setType("shop")}
                className={`py-2.5 px-4 rounded-xl font-poppins font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  restaurant.is_active
                    ? type === "shop"
                      ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] cursor-not-allowed opacity-90 shadow-2xs"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                    : type === "shop"
                    ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] shadow-xs cursor-pointer"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                <span>🛒</span>
                <span>Shop / Grocery</span>
              </button>
            </div>
            {restaurant.is_active && (
              <p className="font-poppins text-[11px] text-gray-500 italic mt-0.5">
                Vendor classification is locked once approved by admin panel.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
              {type === "shop" ? "Shop Name" : "Restaurant Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your store, specialties, or store hours..."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: Visual Branding & Images */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs flex flex-col gap-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-bold text-base text-[#1A1A1A] flex items-center gap-2">
              🖼️ Visual Assets & Branding
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImageUpload
              purpose="avatar"
              label={type === "shop" ? "Shop Logo / Profile Picture (Main Card Image)" : "Profile Picture / Restaurant Logo (Main Card Image)"}
              value={profileImageUrl}
              onChange={setProfileImageUrl}
            />

            <ImageUpload
              purpose="restaurant-cover"
              label={type === "shop" ? "Cover Image (Shop Banner / Hero Cover)" : "Cover Image (Menu Page Hero Background)"}
              value={coverImageUrl}
              onChange={setCoverImageUrl}
            />
          </div>
        </div>

        {/* SECTION 3: Location & Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-bold text-base text-[#1A1A1A] flex items-center gap-2">
              📍 Store Location & Currency Settings
            </h3>
          </div>

          {/* Interactive Leaflet Map Location Picker */}
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>Store Location Map & Physical Address</span>
              {lat && lng && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              )}
            </label>

            <AddressMapPicker
              initialLat={lat || 30.3753}
              initialLng={lng || 69.3451}
              initialAddress={address}
              onLocationSelect={(loc) => {
                setAddress(loc.address);
                setLat(loc.lat);
                setLng(loc.lng);
              }}
            />
          </div>

          {/* Currency Selection Section */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <label className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider">
              Store Currency
            </label>
            <p className="font-poppins text-xs text-gray-500">
              Select your store&apos;s primary currency symbol or enter a custom currency name/symbol.
            </p>

            <div className="flex flex-wrap gap-2">
              {POPULAR_CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(curr);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-poppins text-xs font-bold transition-all cursor-pointer ${
                    selectedCurrency === curr
                      ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {curr}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedCurrency("CUSTOM")}
                className={`px-3.5 py-2 rounded-xl font-poppins text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === "CUSTOM"
                    ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                ✏️ Custom Currency
              </button>
            </div>

            {/* Custom Currency Text Input */}
            {selectedCurrency === "CUSTOM" && (
              <div className="flex flex-col gap-1 mt-1">
                <label className="font-poppins text-xs font-semibold text-gray-700">
                  Type Custom Currency Name / Symbol:
                </label>
                <input
                  type="text"
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value)}
                  placeholder="e.g. PHP (₱), BGN (lv), NGN (₦)..."
                  className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Categories & Cuisines Offered */}
        {(() => {
          const shopNames = ["GROCERY", "BAKERY", "CONVENIENCE", "SUPERMARKET", "SNACKS & DRINKS", "FRESH PRODUCE"];
          const shopFiltered = cuisines.filter((c) =>
            shopNames.some((sn) => c.name.toUpperCase().includes(sn))
          );
          const restFiltered = cuisines.filter(
            (c) => !shopNames.some((sn) => c.name.toUpperCase().includes(sn))
          );

          const defaultShopCategories: Cuisine[] = [
            { id: 101, name: "Grocery" },
            { id: 102, name: "Bakery" },
            { id: 103, name: "Convenience" },
            { id: 104, name: "Supermarket" },
            { id: 105, name: "Snacks & Drinks" },
            { id: 106, name: "Fresh Produce" },
          ];

          let activeCategoryList: Cuisine[] = [];

          if (type === "shop") {
            if (shopFiltered.length > 0) {
              activeCategoryList = shopFiltered;
            } else {
              activeCategoryList = defaultShopCategories.map((sc) => {
                const match = cuisines.find((c) => c.name.toUpperCase() === sc.name.toUpperCase());
                return match ? { id: match.id, name: match.name } : sc;
              });
            }
          } else {
            activeCategoryList = restFiltered.length > 0 ? restFiltered : cuisines;
          }

          // Sanitize active list from malformed names
          activeCategoryList = activeCategoryList.filter(
            (c) => c.name && !c.name.startsWith("Fav Cuisine") && !c.name.match(/\d{10,}/)
          );

          if (activeCategoryList.length === 0) return null;

          return (
            <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-2xs flex flex-col gap-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-poppins font-bold text-base text-[#1A1A1A] flex items-center gap-2">
                  🏷️ {type === "shop" ? "Categories Offered" : "Cuisines Offered"}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {activeCategoryList.map((c) => {
                  const selected = selectedCuisineIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCuisine(c.id)}
                      className={`px-4 py-2 rounded-xl font-poppins text-xs font-bold transition-all cursor-pointer ${
                        selected
                          ? "bg-[#FCBA08] text-[#2B1B0E] shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Save Button */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-sm self-start cursor-pointer disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving Profile..." : "Save Profile Changes"}
        </button>
      </form>
    </div>
  );
}
