"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRestaurantDetail } from "@/lib/useRestaurantData";

interface MenuHeroProps {
  restaurantId?: string;
  restaurantName?: string;
  coverImageUrl?: string;
}

export default function MenuHero({
  restaurantId = "1",
  restaurantName: propName,
  coverImageUrl: propCoverImage,
}: MenuHeroProps) {
  const { data: restaurant } = useRestaurantDetail(restaurantId);

  const title = propName || restaurant?.name || "AL BASIT RESTAURANT";
  const heroImage =
    propCoverImage ||
    restaurant?.coverImageUrl ||
    restaurant?.profileImageUrl ||
    restaurant?.image ||
    "/menu.png";

  return (
    <section className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] bg-[#111111] overflow-hidden flex flex-col justify-between">
      {/* Background Cover Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src={heroImage}
          alt={`${title} Cover`}
          fill
          priority
          unoptimized={heroImage.startsWith("data:") || heroImage.startsWith("http")}
          sizes="100vw"
          className="object-cover object-center brightness-90 contrast-105"
        />
        {/* Dark Vignette Overlay for rich text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
      </div>

      {/* Floating Glassmorphic Centered Navbar */}
      <Navbar activeTab="restaurant" />

      {/* Menu Hero Content */}
      <main className="w-full flex-1 flex items-center px-6 sm:px-10 lg:px-12 pt-8 pb-16 sm:pb-20 lg:pb-24 z-10">
        <div className="w-full max-w-[1196px] mx-auto flex flex-col justify-center items-start text-left">
          {/* Main Title: Restaurant Name */}
          <h1 className="font-mali uppercase text-[38px] sm:text-[50px] md:text-[60px] lg:text-[66px] leading-tight text-[#FCBA08] font-bold tracking-wide select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="font-poppins font-normal text-white text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] mt-3 sm:mt-4 tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Easy Ordering. Fast Delivery.
          </p>
        </div>
      </main>
    </section>
  );
}
