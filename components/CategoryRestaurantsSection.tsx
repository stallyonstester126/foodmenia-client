"use client";

import { useRef, useState } from "react";
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

      {/* Category Heading with Item Count */}
      <div className="flex items-center justify-between z-10">
        <h2 className="font-mali uppercase text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#2B1B0E] tracking-tight select-none">
          {title}
        </h2>
        <span className="font-poppins text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {items.length} {type === "shop" ? (items.length === 1 ? "shop" : "shops") : (items.length === 1 ? "venue" : "venues")}
        </span>
      </div>

      {/* 2-Card Horizontal Scroll Slider */}
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
                      src={item.image || (type === "shop" ? "/shophero.png" : "/ResturantHero.png")}
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

                    <p className="font-poppins text-xs sm:text-[13px] text-gray-500 font-normal truncate">
                      {item.cuisine || (type === "shop" ? "Grocery & Bakery" : "Fast Food · Local Specialty")}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-gray-400 text-xs font-poppins">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{item.deliveryTime || "20-35 mins"} · Free Delivery</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
      </div>

      {/* Big Centered Arrow Controls Below Cards */}
      {items.length > 2 && (
        <div className="flex items-center justify-center gap-4 mt-2 select-none z-10">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF3D4] hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-2xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FCBA08]/30 focus:outline-none"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF3D4] hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-2xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FCBA08]/30 focus:outline-none"
          >
            ›
          </button>
        </div>
      )}

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
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const { data: restaurants, isLoading } = useRestaurants({ type });

  const rawList = Array.isArray(restaurants)
    ? restaurants
    : (restaurants as unknown as { restaurants?: typeof restaurants; data?: typeof restaurants })?.restaurants ||
      (restaurants as unknown as { restaurants?: typeof restaurants; data?: typeof restaurants })?.data ||
      [];

  // Strict type segregation: only restaurant on /restaurant, only shop on /shop
  const typedList = rawList.filter((r) => r.type === type);

  // Curated comprehensive category lists per type (no emojis)
  const availableCategories =
    type === "shop"
      ? [
          { id: "ALL", label: "All Shops" },
          { id: "SUPERMARKET", label: "Supermarket" },
          { id: "GROCERY", label: "Grocery & Staples" },
          { id: "BAKERY", label: "Bakery & Bread" },
          { id: "FRESH PRODUCE", label: "Fresh Produce" },
          { id: "DAIRY & EGGS", label: "Dairy & Eggs" },
          { id: "MEAT & POULTRY", label: "Meat & Poultry" },
          { id: "SNACKS & DRINKS", label: "Snacks & Drinks" },
          { id: "PHARMACY", label: "Pharmacy & Wellness" },
          { id: "HOUSEHOLD", label: "Household & Cleaning" },
        ]
      : [
          { id: "ALL", label: "All Categories" },
          { id: "FAST FOOD", label: "Fast Food" },
          { id: "DESI & BBQ", label: "Desi & BBQ" },
          { id: "BURGERS", label: "Burgers & Sandwiches" },
          { id: "PIZZA", label: "Pizza & Italian" },
          { id: "BIRYANI", label: "Biryani & Pulao" },
          { id: "CHINESE", label: "Chinese & Asian" },
          { id: "SHAWARMA", label: "Shawarma & Wraps" },
          { id: "BEVERAGES", label: "Beverages & Cafe" },
          { id: "DESSERTS", label: "Desserts & Sweets" },
          { id: "SEAFOOD", label: "Seafood" },
        ];

  // Helper to determine if an item belongs to a category
  const matchesCategory = (categoryId: string, item: Restaurant) => {
    if (item.type !== type) return false;
    if (categoryId === "ALL") return true;

    // 1. Direct cuisine matching from database cuisines attached to the restaurant
    const assignedCuisineNames = (item.cuisines || []).map((c) => (c.name || "").toUpperCase());
    const joinedCuisineString = (item.cuisine || "").toUpperCase();
    const upperName = (item.name || "").toUpperCase();

    // 2. Keyword mapping for robust matching
    const keywordMap: Record<string, string[]> = {
      "FAST FOOD": ["FAST FOOD", "BURGER", "PIZZA", "SANDWICH", "SHAWARMA", "WRAP", "FRIES"],
      "DESI & BBQ": ["DESI", "PAKISTANI", "BBQ", "GRILL", "KARAHI", "TIKKA", "HANDI", "BIRYANI", "PULAO", "NIHARI"],
      "BURGERS": ["BURGER", "SANDWICH", "ZINGER"],
      "PIZZA": ["PIZZA", "ITALIAN", "PASTA", "SPAGHETTI"],
      "BIRYANI": ["BIRYANI", "PULAO", "RICE"],
      "CHINESE": ["CHINESE", "ASIAN", "NOODLE", "DUMPLING", "CHOW MEIN"],
      "SHAWARMA": ["SHAWARMA", "WRAP", "ROLL", "PARATHA"],
      "BEVERAGES": ["BEVERAGE", "DRINK", "SHAKE", "JUICE", "COFFEE", "TEA", "CAFE"],
      "DESSERTS": ["DESSERT", "SWEET", "CAKE", "ICE CREAM", "WAFFLE", "KHEER", "HALWA"],
      "SEAFOOD": ["SEAFOOD", "FISH", "PRAWN", "SHRIMP"],
      "SUPERMARKET": ["SUPERMARKET", "MART", "HYPERMARKET", "STORE"],
      "GROCERY": ["GROCERY", "STAPLE", "MART", "FLOUR", "RICE", "OIL", "PULSES"],
      "BAKERY": ["BAKERY", "BREAD", "BUN", "PASTRY", "CROISSANT", "RUSK"],
      "FRESH PRODUCE": ["FRESH PRODUCE", "PRODUCE", "FRUIT", "VEGETABLE"],
      "DAIRY & EGGS": ["DAIRY", "EGG", "MILK", "YOGURT", "CHEESE", "BUTTER"],
      "MEAT & POULTRY": ["MEAT", "POULTRY", "CHICKEN", "BEEF", "MUTTON"],
      "SNACKS & DRINKS": ["SNACK", "CHIP", "DRINK", "BEVERAGE", "JUICE", "SODA", "BISCUIT"],
      "PHARMACY": ["PHARMACY", "WELLNESS", "MEDICINE", "HEALTH", "CARE", "MEDICAL", "DRUG"],
      "HOUSEHOLD": ["HOUSEHOLD", "CLEANING", "DETERGENT", "SOAP"],
    };

    const keywords = keywordMap[categoryId] || [categoryId];

    // Priority A: Check if any assigned cuisine matches keywords
    const matchesAssignedCuisine = assignedCuisineNames.some((cName) =>
      keywords.some((kw) => cName.includes(kw))
    );
    if (matchesAssignedCuisine) return true;

    // Priority B: Check if joined cuisine string matches keywords
    const matchesJoinedCuisine = keywords.some((kw) => joinedCuisineString.includes(kw));
    if (matchesJoinedCuisine) return true;

    // Priority C: Check if restaurant/shop name matches keywords
    return keywords.some((kw) => upperName.includes(kw));
  };

  // Determine which sections to render
  const categorySectionsToRender = (() => {
    if (selectedCategory !== "ALL") {
      const filtered = typedList.filter((item) => matchesCategory(selectedCategory, item));
      const activeMeta = availableCategories.find((c) => c.id === selectedCategory);
      return [
        {
          title: activeMeta ? activeMeta.label.toUpperCase() : selectedCategory,
          items: filtered,
        },
      ];
    }

    // When "ALL": group only categories that ACTUALLY have matching venues
    const categoryIds = availableCategories.filter((c) => c.id !== "ALL");
    const activeSections = categoryIds
      .map((cat) => {
        const matched = typedList.filter((item) => matchesCategory(cat.id, item));
        return {
          title: cat.label.toUpperCase(),
          items: matched,
        };
      })
      .filter((sec) => sec.items.length > 0);

    // If no individual categories matched (e.g. initial setup), render general section
    if (activeSections.length === 0 && typedList.length > 0) {
      return [
        {
          title: type === "shop" ? "ALL SHOPS & MARTS" : "ALL FEATURED RESTAURANTS",
          items: typedList,
        },
      ];
    }

    return activeSections;
  })();

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
        {/* Interactive Category Filter Pills with Scroll Controls and Visible Scrollbar */}
        <div className="mb-10 sm:mb-12 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-gray-400">
                Filter By Category
              </h3>
              {/* Scroll buttons for quick horizontal navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("categories-filter-scroll-container");
                    if (el) el.scrollBy({ left: -220, behavior: "smooth" });
                  }}
                  aria-label="Scroll categories left"
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("categories-filter-scroll-container");
                    if (el) el.scrollBy({ left: 220, behavior: "smooth" });
                  }}
                  aria-label="Scroll categories right"
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95"
                >
                  ›
                </button>
              </div>
            </div>

            {selectedCategory !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className="text-xs font-poppins font-semibold text-[#FCBA08] hover:underline"
              >
                Clear filter (Show All)
              </button>
            )}
          </div>

          {/* Visible, smooth horizontal scrollbar container */}
          <div
            id="categories-filter-scroll-container"
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-3 pt-1 [scrollbar-width:thin] [scrollbar-color:#FCBA08_#F3F4F6] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#FCBA08] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#e5a807]"
          >
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === "ALL"
                  ? typedList.length
                  : typedList.filter((item) => matchesCategory(cat.id, item)).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-full font-poppins text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E] shadow-sm scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-[#FCBA08]/20 text-[#FCBA08]" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Sections Rendering */}
        <div className="flex flex-col gap-12 sm:gap-16">
          {categorySectionsToRender.length === 0 || categorySectionsToRender.every((s) => s.items.length === 0) ? (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100/70 flex items-center justify-center text-[#2B1B0E]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-mali text-xl font-bold text-[#2B1B0E]">
                No {type === "shop" ? "shops" : "restaurants"} found in this category
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-gray-500 max-w-md">
                We couldn&apos;t find any {type === "shop" ? "shops" : "restaurants"} matching the selected category.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className="mt-2 bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#e5a807] transition-all shadow-sm cursor-pointer"
              >
                View All {type === "shop" ? "Shops" : "Restaurants"}
              </button>
            </div>
          ) : (
            categorySectionsToRender.map((section) => (
              <CategoryRow
                key={section.title}
                title={section.title}
                items={section.items}
                isLoading={isLoading}
                type={type}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
