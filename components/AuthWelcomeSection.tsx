"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthWelcomeSection() {
  return (
    <div className="w-full min-h-screen bg-[#FCBA08] flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* TOP SEMICIRCLE BRAND AREA */}
      <div className="w-full max-w-[480px] pt-12 pb-10 px-6 bg-[#FCBA08] rounded-b-[40%] text-center shadow-sm relative z-10 flex flex-col items-center">
        {/* Brand Logo Text */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-poppins text-3xl sm:text-4xl font-bold tracking-tight inline-flex items-center leading-none">
            <span className="text-white drop-shadow-sm">food</span>
            <span className="text-[#2B1B0E]">menia</span>
          </span>
        </div>
        <p className="font-poppins text-xs sm:text-sm font-semibold text-[#2B1B0E]">
          Easy Ordering. Fast Delivery.
        </p>
      </div>

      {/* CENTER HERO MASCOT IMAGE (login.png) */}
      <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] my-auto flex items-center justify-center z-10">
        <Image
          src="/login.png"
          alt="FoodMenia Sloth Mascot"
          fill
          className="object-contain drop-shadow-xl"
          priority
        />
      </div>

      {/* BOTTOM ACTION BUTTONS CONTAINER */}
      <div className="w-full max-w-[480px] px-6 pb-12 pt-8 flex flex-col gap-3.5 relative z-10">
        {/* Create an account button */}
        <Link
          href="/register"
          className="w-full h-[50px] rounded-2xl bg-white hover:bg-gray-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center text-center cursor-pointer border border-gray-100"
        >
          Create an account
        </Link>

        {/* Login button */}
        <Link
          href="/login"
          className="w-full h-[50px] rounded-2xl border-2 border-[#2B1B0E]/20 bg-transparent hover:bg-[#2B1B0E]/5 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center text-center cursor-pointer"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
