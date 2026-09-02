"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import ShopHero from "@/components/ShopHero";
import SearchSection from "@/components/SearchSection";
import CategoryRestaurantsSection from "@/components/CategoryRestaurantsSection";
import DealsSection from "@/components/DealsSection";
import PromoBannerSection from "@/components/PromoBannerSection";
import Footer from "@/components/Footer";

export default function ShopPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "restaurant_owner") {
      router.replace("/restaurant-dashboard");
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (!isLoading && isAuthenticated && user?.role === "restaurant_owner") {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FCBA08] border-t-transparent rounded-full animate-spin mb-2" />
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <div>
        {/* Shop Hero Section */}
        <ShopHero />
        {/* Search Component right below Shop Hero */}
        <SearchSection />
        {/* Deals & Promotions */}
        <DealsSection />
        {/* Shop Vendors Listing */}
        <CategoryRestaurantsSection type="shop" />
        {/* Promotional Banners */}
        <PromoBannerSection />
      </div>
      <Footer />
    </main>
  );
}
