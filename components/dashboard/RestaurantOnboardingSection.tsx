"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ImageUpload from "@/components/ImageUpload";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";

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

interface RestaurantOnboardingSectionProps {
  onSuccess: () => void;
  cuisines: Cuisine[];
}

export default function RestaurantOnboardingSection({
  onSuccess,
  cuisines,
}: RestaurantOnboardingSectionProps) {
  const { user, updateUser } = useAuthStore();
  const [type, setType] = useState<"restaurant" | "shop">("restaurant");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [selectedCuisineIds, setSelectedCuisineIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const toggleCuisine = (id: number) => {
    setSelectedCuisineIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.post("/restaurant-owner/restaurants", {
        name,
        description,
        type,
        profileImageUrl: profileImageUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        address,
        lat,
        lng,
        cuisineIds: selectedCuisineIds,
      });

      updateUser({ hasRestaurant: true });
      setIsPendingApproval(true);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to onboard venue. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col justify-between select-none">
      {/* Golden Header & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6">
        <Navbar activeTab="restaurant" />
      </div>

      <main className="w-full max-w-[800px] mx-auto px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-mali uppercase text-[28px] sm:text-[34px] font-bold text-[#2B1B0E]">
              RESTAURANT ONBOARDING
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 mt-1">
              Welcome {user?.name}! Set up your restaurant details to get started.
            </p>
          </div>
        </div>

        {isPendingApproval ? (
          <div className="w-full bg-white rounded-[24px] border border-amber-200 p-8 shadow-sm flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-3xl">
              ⏳
            </div>
            <h2 className="font-mali text-2xl font-bold text-[#2B1B0E]">
              Submission Received &amp; Pending Approval!
            </h2>
            <p className="font-poppins text-sm text-gray-600 max-w-lg leading-relaxed">
              Your restaurant <strong className="text-gray-900">{name}</strong> has been registered successfully. Our administrative team will review your application shortly.
            </p>
            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-poppins text-amber-800 text-left flex items-start gap-3 mt-2">
              <span className="text-base">ℹ️</span>
              <div>
                <strong>Notice:</strong> Your restaurant is currently in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">is_active = false</code> status. It will not be visible on public search or customer listings until approved by an administrator.
              </div>
            </div>
            <button
              type="button"
              onClick={onSuccess}
              className="mt-4 bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Go to Owner Dashboard →
            </button>
          </div>
        ) : (
          <div className="w-full bg-white rounded-[24px] border border-gray-200/80 p-6 sm:p-8 shadow-sm">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-poppins font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Vendor Type Selection */}
              <div className="flex flex-col gap-2 p-4 bg-[#FCBA08]/10 border border-[#FCBA08]/30 rounded-2xl">
                <label className="font-poppins text-xs font-bold text-[#2B1B0E] uppercase tracking-wider">
                  What are you setting up? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (type !== "restaurant") {
                        setType("restaurant");
                        setSelectedCuisineIds([]);
                      }
                    }}
                    className={`py-3 px-4 rounded-xl font-poppins font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === "restaurant"
                        ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>🍔</span>
                    <span>Restaurant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (type !== "shop") {
                        setType("shop");
                        setSelectedCuisineIds([]);
                      }
                    }}
                    className={`py-3 px-4 rounded-xl font-poppins font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === "shop"
                        ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>🛒</span>
                    <span>Shop / Grocery</span>
                  </button>
                </div>
              </div>

              {/* Restaurant / Shop Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  {type === "shop" ? "Shop Name" : "Restaurant Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "shop" ? "e.g. FoodMenia Supermarket" : "e.g. Al Basit Tikka & Karahi"}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your specialties, authentic flavors, and history..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all resize-none"
                />
              </div>

              {/* Profile Picture (Logo) & Cover Image (Menu Hero) Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUpload
                  purpose="avatar"
                  label="Profile Picture / Restaurant Logo (Main Card Image)"
                  value={profileImageUrl}
                  onChange={setProfileImageUrl}
                />

                <ImageUpload
                  purpose="restaurant-cover"
                  label="Cover Image (Menu Page Hero Background)"
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                />
              </div>

              {/* Address / Location Map Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A] flex items-center justify-between">
                  <span>Store Location Map &amp; Physical Address</span>
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

              {/* Cuisines / Categories Selector */}
              {(() => {
                const shopKeywords = [
                  "GROCERY",
                  "BAKERY",
                  "CONVENIENCE",
                  "SUPERMARKET",
                  "SNACKS & DRINKS",
                  "FRESH PRODUCE",
                  "DAIRY & EGGS",
                  "MEAT & POULTRY",
                  "PHARMACY & WELLNESS",
                  "HOUSEHOLD & CLEANING",
                  "MART",
                  "PHARMACY",
                ];

                const isShopItem = (name: string) => {
                  const upper = name.toUpperCase();
                  return shopKeywords.some((keyword) => upper.includes(keyword));
                };

                const isCleanItem = (name: string) => {
                  const upper = name.toUpperCase();
                  return !upper.startsWith("FAV CUISINE") && !/\d{5,}/.test(upper);
                };

                // Strictly segregated categories
                const restaurantCategories = cuisines.filter(
                  (c) => isCleanItem(c.name) && !isShopItem(c.name)
                );

                const shopCategories = cuisines.filter(
                  (c) => isCleanItem(c.name) && isShopItem(c.name)
                );

                const activeCategoryList: Cuisine[] =
                  type === "shop" ? shopCategories : restaurantCategories;

                if (activeCategoryList.length === 0) return null;

                return (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-150">
                    <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                      {type === "shop" ? "Shop & Grocery Categories Offered" : "Restaurant Cuisines Offered"}
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeCategoryList.map((c) => {
                        const selected = selectedCuisineIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCuisine(c.id)}
                            className={`px-3.5 py-2 rounded-xl font-poppins text-xs font-semibold transition-all ${
                              selected
                                ? "bg-[#FCBA08] text-[#2B1B0E] shadow-sm scale-[1.02]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-base py-4 rounded-xl transition-all shadow-md mt-4 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Restaurant for Approval →"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
