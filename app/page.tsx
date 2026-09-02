"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import DealsSection from "@/components/DealsSection";
// import CuisinesSection from "@/components/CuisinesSection";
import RestaurantsSection from "@/components/RestaurantsSection";
import PromoBannerSection from "@/components/PromoBannerSection";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const isVendor =
    user?.role === "restaurant_owner" ||
    user?.role === "shop_owner" ||
    user?.role === "vendor";

  useEffect(() => {
    if (!isLoading && isAuthenticated && isVendor) {
      router.replace("/restaurant-dashboard");
    }
  }, [user, isAuthenticated, isLoading, router, isVendor]);

  if (isLoading || (isAuthenticated && isVendor)) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center select-none">
        <div className="w-8 h-8 border-3 border-[#FCBA08] border-t-transparent rounded-full animate-spin mb-2" />
        <span className="font-poppins text-xs text-gray-500 font-medium">
          Loading dashboard...
        </span>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <div>
        <HeroSection />
        <SearchSection />
        <DealsSection />
        {/* <CuisinesSection /> */}
        <RestaurantsSection />
        <PromoBannerSection />
      </div>
      <Footer />
    </main>
  );
}
