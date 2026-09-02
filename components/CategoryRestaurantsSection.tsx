"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRestaurants, Restaurant } from "@/lib/useRestaurantData";
import FavoriteButton from "@/components/FavoriteButton";

interface CategoryRestaurantsSectionProps {
  type?: "restaurant" | "shop";
}

interface CategoryRowProps {
  title: string;
  items: Restaurant[];
  isLoading: boolean;
  type: "restaurant" | "shop";
}

function CategoryRow({ title, items, isLoading, type }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex flex-col gap-6">
      {/* Left Planet Graphic */}
      <div className="absolute -left-12 sm:-left-16 top-12 w-28 sm:w-36 h-auto pointer-events-none select-none z-0 opacity-80 rotate-[-15deg]">
        <Image
          src="/planet.png"
          alt=""
          width={600}
          height={600}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Right Peeking Yellow Blob Shape */}
      <div className="absolute -right-12 sm:-right-16 top-16 w-[120px] sm:w-[160px] lg:w-[200px] h-[180px] sm:h-[230px] pointer-events-none select-none z-0">
        <div
          className="w-full h-full bg-[#FCBA08]"
          style={{
            borderRadius: "60% 40% 40% 60% / 50% 50% 50% 50%",
            transform: "rotate(-15deg)",
          }}
        />
      </div>

      {/* Category Heading */}
      <h2 className="font-mali uppercase text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#2B1B0E] tracking-tight select-none z-10">
        {title}
      </h2>

      {/* 2-Card Horizontal Scroll Slider (Shows 2 cards at a time on desktop, scroll for all) */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory py-2 relative z-10 scroll-smooth"
      >
        {isLoading
          ? Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full md:w-[calc(50%-0.75rem)] flex-shrink-0 rounded-[20px] sm:rounded-[24px] bg-gray-100 h-[260px] animate-pulse"
              />
            ))
          : items.map((item) => (
              <div
                key={item.id}
                className="w-full md:w-[calc(50%-0.75rem)] flex-shrink-0 snap-start"
              >
                <Link
                  href={`/menu/${item.id}`}
                  className="rounded-[20px] sm:rounded-[24px] border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer group flex flex-col bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative h-full"
                >
                  {/* Card Image */}
                  <div className="relative w-full aspect-[16/10] bg-gray-50 overflow-hidden rounded-t-[19px] sm:rounded-t-[23px]">
                    <Image
                      src={item.image || "/ResturantHero.png"}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <FavoriteButton entityType={type} entityId={item.id} />
                  </div>

                  {/* Card Details */}
                  <div className="p-4 sm:p-5 flex flex-col gap-1 bg-white flex-1 justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-poppins font-bold text-[16px] sm:text-[17px] text-[#2B1B0E] truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[#FCBA08] text-sm leading-none">★</span>
                        <span className="font-poppins text-xs sm:text-sm text-gray-500 font-medium">
                          {item.rating || "4.8"}
                        </span>
                      </div>
                    </div>

                    <p className="font-poppins text-xs sm:text-[13px] text-gray-500 font-normal">
                      {item.cuisine || "$ · Fast Food"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
      </div>

      {/* Big Centered Arrow Controls Below Cards */}
      <div className="flex items-center justify-center gap-4 mt-4 select-none z-10">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF3D4] hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FCBA08]/30 focus:outline-none"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF3D4] hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FCBA08]/30 focus:outline-none"
        >
          ›
        </button>
      </div>

      {/* Section Divider: ○ ○ 🦥 ● ● */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-6 sm:mt-8 select-none z-10">
        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-[2.5px] border-[#FCBA08] bg-transparent inline-block" />
        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-[2.5px] border-[#FCBA08] bg-transparent inline-block" />

        <div className="relative w-7 h-7 sm:w-8 sm:h-8 mx-1 flex items-center justify-center">
          <Image
            src="/hi.png"
            alt="Sloth Mascot"
            width={32}
            height={32}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#FCBA08] inline-block" />
        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#FCBA08] inline-block" />
      </div>
    </div>
  );
}

export default function CategoryRestaurantsSection({
  type = "restaurant",
}: CategoryRestaurantsSectionProps) {
  const { data: restaurants, isLoading } = useRestaurants({ type });

  const categoryTitles =
    type === "shop"
      ? ["GROCERY", "BAKERY", "CONVENIENCE", "SUPERMARKET"]
      : ["CHINESE", "ITALIAN", "DESSERTS", "FAST FOOD"];

  const rawList = Array.isArray(restaurants)
    ? restaurants
    : (restaurants as unknown as { restaurants?: typeof restaurants; data?: typeof restaurants })?.restaurants ||
      (restaurants as unknown as { restaurants?: typeof restaurants; data?: typeof restaurants })?.data ||
      [];
  const typedList = rawList.filter((r) => !r.type || r.type === type);

  return (
    <section className="relative w-full bg-white overflow-hidden py-10 sm:py-14 lg:py-16">
      {/* Top-Left Corner Decoration: Large Yellow Egg Shape with Hand Image (/hand.png) */}
      <div className="absolute top-0 left-0 -translate-x-10 sm:-translate-x-12 -translate-y-6 pointer-events-none select-none z-0">
        <div className="relative w-[180px] sm:w-[230px] lg:w-[260px] h-[240px] sm:h-[300px] lg:h-[340px]">
          <div className="absolute inset-0 bg-[#FCBA08] rounded-[50%] -rotate-12 opacity-100" />
          <div className="absolute top-14 left-8 sm:top-18 sm:left-10 lg:top-20 lg:left-11 w-20 sm:w-28 lg:w-32 h-auto z-10">
            <Image
              src="/hand.png"
              alt="Hand Icon"
              width={125}
              height={170}
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-12 sm:gap-16">
          {categoryTitles.map((title, groupIdx) => {
            const matchedItems = typedList.filter(
              (r) =>
                r.cuisine?.toUpperCase().includes(title) ||
                r.name.toUpperCase().includes(title)
            );

            // Show matched items for this category, or slice full list for rich variety if no exact title match
            const categoryItems =
              matchedItems.length > 0
                ? matchedItems
                : typedList.slice((groupIdx * 2) % Math.max(1, typedList.length));

            return (
              <CategoryRow
                key={title}
                title={title}
                items={categoryItems}
                isLoading={isLoading}
                type={type}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
