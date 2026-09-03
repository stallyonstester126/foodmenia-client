"use client";

import { useState } from "react";
import Image from "next/image";

const deals = [
  {
    id: 1,
    image: "/card1.jpg",
    title: "50% off your 1st order + FREE delivery",
    code: "WELCOME50",
  },
  {
    id: 2,
    image: "/card2.png",
    title: "Up to $10 off your favorite meal",
    code: "FOODMENIA",
  },
  {
    id: 3,
    image: "/card3.jpg",
    title: "Free delivery on orders over $25",
    code: "FREEDELIVERY",
  },
];

export default function DealsSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="relative w-full bg-white overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-14 sm:pb-18 lg:pb-20">
      {/* Geometric Lines Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/Rectangle 59.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Heading */}
        <h2 className="font-mali text-[26px] sm:text-[30px] md:text-[34px] font-bold text-[#2B1B0E] uppercase tracking-wide mb-6 sm:mb-8 select-none">
          YOUR DAILY DEALS
        </h2>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => handleCopy(deal.code)}
              className="relative w-full aspect-[1470/1801] rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
            >
              <Image
                src={deal.image}
                alt={deal.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />

              {/* Toast when code is copied */}
              {copiedCode === deal.code && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 transition-all">
                  <span className="bg-white text-[#2B1B0E] font-poppins font-bold px-4 py-2 rounded-xl shadow-lg text-sm">
                    Copied Code: {deal.code}!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 select-none">
          {/* Previous Arrow Button */}
          <button
            type="button"
            aria-label="Previous Deals"
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
          >
            <svg
              className="w-5 h-5 text-[#1A1A1A] stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            aria-label="Next Deals"
            className="w-12 h-12 rounded-full bg-[#FCBA08] shadow-[0_4px_16px_rgba(252,186,8,0.4)] flex items-center justify-center text-white hover:bg-[#e5a807] hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
          >
            <svg
              className="w-5 h-5 text-white stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
