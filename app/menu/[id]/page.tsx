"use client";

import MenuHero from "@/components/MenuHero";
import MenuItemsSection from "@/components/MenuItemsSection";
import Footer from "@/components/Footer";
import { useRestaurantDetail } from "@/lib/useRestaurantData";

interface MenuIdPageProps {
  params: {
    id: string;
  };
}

export default function DynamicMenuPage({ params }: MenuIdPageProps) {
  const restaurantId = params.id ? decodeURIComponent(params.id) : "1";
  const { data: restaurant } = useRestaurantDetail(restaurantId);

  const restaurantName = restaurant?.name || "RESTAURANT MENU";
  const coverImageUrl = restaurant?.coverImageUrl || undefined;

  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <div>
        <MenuHero
          restaurantId={restaurantId}
          restaurantName={restaurantName.toUpperCase()}
          coverImageUrl={coverImageUrl}
        />
        <MenuItemsSection restaurantId={restaurantId} />
      </div>
      <Footer />
    </main>
  );
}
