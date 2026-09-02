"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/lib/useUserData";

type TabType = "all" | "restaurant" | "shop";

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Filter out any non-venue items if present
  const venueFavorites = favorites.filter(
    (fav) => fav.type === "restaurant" || fav.type === "shop" || Boolean(fav.restaurant)
  );

  const filteredFavorites = venueFavorites.filter((fav) => {
    if (activeTab === "restaurant") return fav.type === "restaurant";
    if (activeTab === "shop") return fav.type === "shop";
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* Header with Yellow Banner & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* Page Heading & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] tracking-tight">
            MY FAVORITES
          </h1>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`font-poppins text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                activeTab === "all"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({venueFavorites.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("restaurant")}
              className={`font-poppins text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                activeTab === "restaurant"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Restaurants ({venueFavorites.filter((f) => f.type === "restaurant").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shop")}
              className={`font-poppins text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                activeTab === "shop"
                  ? "bg-[#2B1B0E] text-[#FCBA08] shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Shops ({venueFavorites.filter((f) => f.type === "shop").length})
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          /* Empty State */
          <div className="w-full max-w-lg mx-auto bg-gray-50/80 border border-gray-100 rounded-[28px] p-8 sm:p-12 text-center flex flex-col items-center gap-4 my-8 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#FCBA08]/20 flex items-center justify-center text-4xl select-none">
              💖
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-mali text-xl sm:text-2xl font-bold text-[#2B1B0E]">
                You haven&apos;t favorited any restaurants or shops yet
              </h2>
              <p className="font-poppins text-xs sm:text-sm text-gray-500 max-w-sm">
                Browse restaurants and shops to save your top spots for quick ordering!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 select-none">
              <Link
                href="/restaurant"
                className="bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-[#e5a807] transition-all shadow-sm"
              >
                Browse Restaurants
              </Link>
              <Link
                href="/shop"
                className="bg-[#2B1B0E] text-white font-poppins font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-sm"
              >
                Explore Shops
              </Link>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredFavorites.map((fav) => {
              const venue = fav.restaurant;
              if (!venue) return null;

              // Prioritize profile image over cover image as requested by user
              const profileImg = venue.profile_image_url;
              const coverImg = venue.cover_image_url;
              const mainDisplayImg =
                profileImg || coverImg || (venue.type === "shop" ? "/shophero.png" : "/ResturantHero.png");

              const cuisinesText =
                venue.cuisines && venue.cuisines.length > 0
                  ? venue.cuisines.map((c) => c.name).join(" · ")
                  : venue.type === "shop"
                  ? "Grocery & Bakery"
                  : "Fast Food";

              return (
                <div
                  key={fav.id}
                  className="rounded-[24px] border border-gray-200/90 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group overflow-hidden"
                >
                  <FavoriteButton entityType={venue.type} entityId={venue.id} />

                  <Link href={`/menu/${venue.id}`} className="w-full flex flex-col">
                    {/* Hero Banner / Profile Image Container */}
                    <div className="relative w-full aspect-[16/9.5] bg-gray-50 overflow-hidden">
                      <Image
                        src={mainDisplayImg}
                        alt={venue.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={Boolean(mainDisplayImg && mainDisplayImg.startsWith("data:"))}
                      />
                      <div className="absolute top-3 left-3 bg-[#2B1B0E]/80 backdrop-blur-md text-[#FCBA08] font-poppins font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full tracking-wider">
                        {venue.type}
                      </div>

                      {/* Optional Overlay Avatar Badge if cover image & profile image both exist */}
                      {coverImg && profileImg && coverImg !== profileImg && (
                        <div className="absolute bottom-2.5 left-3 w-10 h-10 rounded-full border-2 border-white bg-white shadow-md overflow-hidden z-10">
                          <Image
                            src={profileImg}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={profileImg.startsWith("data:")}
                          />
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-poppins font-bold text-base text-[#1A1A1A] truncate group-hover:text-[#FCBA08] transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[#FCBA08] text-xs">★</span>
                          <span className="font-poppins text-xs font-semibold text-gray-600">
                            {venue.rating || 4.5}
                          </span>
                        </div>
                      </div>

                      <p className="font-poppins text-xs text-gray-500 truncate">
                        {cuisinesText}
                      </p>

                      <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-poppins text-xs text-gray-400">
                          ⏱ {venue.delivery_time_min || 20}-{venue.delivery_time_max || 35} mins
                        </span>
                        <span className="bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs px-3.5 py-1.5 rounded-xl group-hover:bg-[#e5a807] transition-all">
                          View Menu
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
