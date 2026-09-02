"use client";

import { useState } from "react";
import Image from "next/image";

export default function SearchSection() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", query);
  };

  return (
    <section className="relative w-full bg-white overflow-hidden py-10 sm:py-14 md:py-16">
      {/* Liquid Splash on Top Right */}
      <div className="absolute top-0 right-0 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[380px] pointer-events-none select-none z-0">
        <Image
          src="/liquid.png"
          alt=""
          width={1200}
          height={896}
          className="w-full h-auto object-contain object-top-right"
        />
      </div>

      {/* Search Bar Container */}
      <div className="relative z-10 w-full max-w-[1060px] mx-auto px-6 sm:px-10 lg:px-12">
        <form
          onSubmit={handleSearch}
          className="w-full flex items-center gap-3 sm:gap-4"
        >
          {/* Search Input Pill */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants, cuisines, and dishes"
              className="w-full h-[54px] sm:h-[58px] px-6 sm:px-8 rounded-full bg-[#F4F4F6] text-[#2B1B0E] placeholder:text-[#9CA3AF] text-[14px] sm:text-[15px] font-poppins font-normal focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
            />
          </div>

          {/* Search Button Circle */}
          <button
            type="submit"
            aria-label="Search"
            className="w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] flex-shrink-0 bg-white rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.09)] border border-gray-100 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
          >
            <svg
              className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#1A1A1A] stroke-[2]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
