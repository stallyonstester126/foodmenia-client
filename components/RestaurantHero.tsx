"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RestaurantHero() {
  return (
    <section className="relative w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] bg-[#111111] overflow-hidden flex flex-col justify-between">
      {/* Background Image with Dark Vignette/Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/ResturantHero.png"
          alt="Restaurant background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-90 contrast-105"
        />
        {/* Dark Vignette Overlay to make text pop sharply */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35" />
      </div>

      {/* Floating Glassmorphic Centered Navbar */}
      <Navbar activeTab="restaurant" />

      {/* Hero Main Content */}
      <main className="w-full flex-1 flex items-center px-6 sm:px-12 lg:px-16 pt-8 pb-16 sm:pb-20 lg:pb-24 z-10">
        <div className="w-full max-w-[1196px] mx-auto flex flex-col justify-center items-start text-left">
          {/* Main Title: RESTAURANTS */}
          <h1 className="font-mali uppercase text-[40px] sm:text-[52px] md:text-[60px] lg:text-[66px] leading-tight text-[#FCBA08] font-bold tracking-wide select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            RESTAURANTS
          </h1>

          {/* Subtitle */}
          <p className="font-poppins font-normal text-white text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] mt-2 sm:mt-3 tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Easy Ordering. Fast Delivery.
          </p>

          {/* Action Button: Shop */}
          <div className="mt-6 sm:mt-8">
            <Link
              href="/#shop"
              className="font-poppins inline-flex items-center justify-center bg-[#421D06] hover:bg-[#5A2808] text-white font-medium text-[15px] sm:text-[16px] w-[128px] sm:w-[138px] h-[44px] sm:h-[46px] rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Shop
            </Link>
          </div>
        </div>
      </main>
    </section>
  );
}
