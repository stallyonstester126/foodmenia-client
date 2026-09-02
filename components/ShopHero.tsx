"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ShopHero() {
  return (
    <section className="relative w-full bg-[#FCBA08] overflow-hidden flex flex-col justify-between">
      {/* Background Wave Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/herobackground.png"
          alt=""
          fill
          className="object-cover object-center opacity-90"
          priority
        />
      </div>

      {/* Floating Glassmorphic Centered Navbar */}
      <Navbar activeTab="shop" />

      {/* Shop Hero Main Content */}
      <main className="w-full flex-1 flex items-center px-6 sm:px-12 lg:px-16 pt-6 pb-12 md:py-10 z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* Left Column: Heading, Subtitle, Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start text-left max-w-[620px]">
            {/* Heading */}
            <h1 className="font-mali uppercase text-[32px] sm:text-[40px] md:text-[46px] lg:text-[48px] leading-[1.08] text-[#1A1A1A] font-bold tracking-wide select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
              CULINARY ARTISTRY,<br />
              PURITY
            </h1>

            {/* Subtitle */}
            <p className="font-poppins font-normal text-[#2B1B0E] text-[16px] sm:text-[18px] md:text-[20px] mt-4 sm:mt-5 tracking-normal">
              Easy Ordering. Fast Delivery.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-7 flex items-center gap-[15px]">
              {/* "Restaurants" Button */}
              <Link
                href="/restaurant"
                className="font-poppins inline-flex items-center justify-center bg-[#2B1B0E] text-white font-medium text-[15px] sm:text-[16px] w-[162px] h-[48px] rounded-[10px] shadow-sm hover:bg-black hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Restaurants
              </Link>

              {/* "Shop" Button (Active) */}
              <Link
                href="/shop"
                className="font-poppins inline-flex items-center justify-center bg-[#2B1B0E]/10 border-[1.5px] border-[#2B1B0E] text-[#2B1B0E] font-semibold text-[15px] sm:text-[16px] w-[115px] h-[48px] rounded-[10px] hover:bg-[#2B1B0E] hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Right Column: Shop 3D Building Mascot Image (shophero.png) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative mt-4 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px] flex items-center justify-center">
              {/* Shop Hero Image */}
              <Image
                src="/shophero.png"
                alt="Shop storefront with sloth mascot"
                width={500}
                height={500}
                className="w-full h-auto object-contain select-none relative z-10 drop-shadow-xl hover:scale-[1.02] transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
