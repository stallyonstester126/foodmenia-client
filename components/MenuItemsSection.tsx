"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRestaurantMenu } from "@/lib/useRestaurantData";
import { useCartStore } from "@/lib/cartStore";
import { getCurrencySymbol } from "@/lib/formatters";

export default function MenuItemsSection({ restaurantId = "1" }: { restaurantId?: string }) {
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const { addToCart, getItemQuantity } = useCartStore();

  // Fetch all menu items for categories extraction
  const { data: allMenuItems = [], isLoading } = useRestaurantMenu(restaurantId);

  // Compute category pills
  const categories = Array.from(
    new Set(["Popular", ...(allMenuItems || []).map((i) => i.category || "Starters")])
  );

  // Filter items for selected category
  const filteredItems =
    activeCategory === "Popular"
      ? allMenuItems
      : allMenuItems.filter(
          (i) => (i.category || "").toLowerCase() === activeCategory.toLowerCase()
        );

  const handleAddToCart = async (item: { id: string; name: string; price: number; image?: string }) => {
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    try {
      await addToCart({
        menuItemId: item.id,
        quantity: 1,
        restaurantId,
        itemName: item.name,
        itemImage: item.image || "/item1.png",
        itemPrice: Number(item.price ?? 0),
      });
    } catch {
      // Ignore cart add errors
    } finally {
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
    }
  };

  return (
    <section className="relative w-full bg-white overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-20">
      {/* Top-Right Sloth Branch Sticker */}
      <div className="absolute top-0 right-0 w-[180px] sm:w-[230px] md:w-[270px] lg:w-[300px] pointer-events-none select-none z-20">
        <Image
          src="/menusticker.png"
          alt="Sloth Hanging on Branch"
          width={350}
          height={350}
          className="w-full h-auto object-contain object-top-right drop-shadow-sm"
          priority
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`font-poppins text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex-shrink-0 focus:outline-none ${
                activeCategory === cat
                  ? "bg-[#FCBA08] text-[#2B1B0E] font-semibold scale-105"
                  : "bg-white text-gray-500 border border-gray-100 hover:text-[#2B1B0E] hover:border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* MENU ITEMS GRID */}
        <div className="relative mt-10 sm:mt-12">
          {/* Section Heading */}
          <h2 className="font-mali uppercase text-[26px] sm:text-[30px] md:text-[34px] font-bold text-[#2B1B0E] tracking-tight mb-6 sm:mb-8 select-none relative z-10">
            {activeCategory.toUpperCase()}
          </h2>

          {/* Item Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative z-10">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-gray-100 rounded-[24px] h-[260px] animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center gap-2">
              <span className="text-3xl">🍲</span>
              <h3 className="font-mali text-lg font-bold text-[#2B1B0E]">No dishes available</h3>
              <p className="font-poppins text-xs text-gray-500">
                No items found under the selected category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative z-10">
              {filteredItems.map((item) => {
                const qtyInCart = getItemQuantity(item.id);
                const itemPrice = Number(
                  item.price ?? (item as unknown as { base_price?: number }).base_price ?? 0
                );

                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="bg-white rounded-[24px] p-4 sm:p-5 border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Food Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-gray-50/60 to-gray-100/40 rounded-[18px] overflow-hidden flex items-center justify-center p-3 mb-3 border border-gray-50">
                      <Image
                        src={item.image || "/item1.png"}
                        alt={item.name}
                        width={240}
                        height={240}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        unoptimized={Boolean(item.image && item.image.startsWith("data:"))}
                      />
                    </div>

                    {/* Card Footer Details */}
                    <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-100/80">
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-poppins text-sm sm:text-[15px] font-bold text-[#2B1B0E] truncate group-hover:text-[#FCBA08] transition-colors">
                          {item.name}
                        </h3>
                        <span className="font-poppins text-sm sm:text-base font-extrabold text-[#1A1A1A] mt-0.5">
                          {getCurrencySymbol(item.currency)}{itemPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Add Button Circle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        aria-label={`Add ${item.name} to order`}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 focus:outline-none flex-shrink-0 relative ${
                          qtyInCart > 0
                            ? "bg-[#2B1B0E] text-[#FCBA08] scale-105"
                            : addedItems[item.id]
                            ? "bg-[#FCBA08] text-[#2B1B0E] scale-110"
                            : "bg-[#FCBA08] text-[#2B1B0E] hover:bg-[#e5a807] hover:scale-105"
                        }`}
                      >
                        {addedItems[item.id] ? (
                          <span className="text-xs font-bold font-poppins">✓</span>
                        ) : (
                          <svg
                            className="w-5 h-5 stroke-[2.5]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}

                        {/* Product Count Badge on Plus Icon */}
                        {qtyInCart > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#FCBA08] text-[#2B1B0E] border-2 border-white text-[11px] font-extrabold font-poppins flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                            {qtyInCart}
                          </span>
                        )}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
