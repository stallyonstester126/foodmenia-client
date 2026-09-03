"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useMenuItemDetail, useRestaurantMenu, useRestaurantDetail } from "@/lib/useRestaurantData";
import { useCartStore } from "@/lib/cartStore";
import CartConflictModal from "@/components/cart/CartConflictModal";
import { toCents, fromCents } from "@/lib/money";
import { getCurrencySymbol } from "@/lib/formatters";

interface ProductDetailProps {
  itemId?: string;
  title?: string;
  price?: string;
  image?: string;
}

const UNAVAILABLE_OPTIONS = [
  "Remove it from my order",
  "Cancel the entire order",
  "Call me to confirm substitute",
];

export default function ProductDetailSection({
  itemId = "item_3",
  title: fallbackTitle,
  price: fallbackPrice,
  image: fallbackImage,
}: ProductDetailProps) {
  const { data: itemData } = useMenuItemDetail(itemId);
  const restaurantId = itemData?.restaurantId || "";
  const { data: restaurantData } = useRestaurantDetail(restaurantId);
  const restaurantName = restaurantData?.name || (itemData as unknown as { restaurantName?: string })?.restaurantName || "Restaurant";
  const { data: restaurantMenuItems } = useRestaurantMenu(restaurantId);
  const { getItemQuantity } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedAddonOptionIds, setSelectedAddonOptionIds] = useState<string[]>([]);
  const [selectedAddonPrices, setSelectedAddonPrices] = useState<Record<string, number>>({});
  
  const [selectedFreqItemIds, setSelectedFreqItemIds] = useState<string[]>([]);
  const [selectedFreqPrices, setSelectedFreqPrices] = useState<Record<string, number>>({});
  const [showMoreBoughtTogether, setShowMoreBoughtTogether] = useState(false);

  const [instructions, setInstructions] = useState("");
  const [unavailableAction, setUnavailableAction] = useState(UNAVAILABLE_OPTIONS[0]);
  const [isUnavailableDropdownOpen, setIsUnavailableDropdownOpen] = useState(false);
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  // Dynamic Product Information
  const title = itemData?.name || fallbackTitle || "JUMBO ZINGER BURGER";
  const basePrice = itemData?.price ?? (fallbackPrice ? parseFloat(fallbackPrice.replace(/[^0-9.]/g, "")) : 0);
  const image = itemData?.image || fallbackImage || "/hero.png";
  const description = itemData?.description || "";

  // Dynamic Addon Groups (loaded from API)
  const addonGroups = itemData?.addonGroups || [];

  // Dynamic Frequently Bought Together (loaded from recommendation algorithm / DB)
  const frequentlyBoughtTogetherList = itemData?.frequentlyBoughtTogether || [];

  // Visible Frequently Bought Together items (limited unless expanded)
  const visibleFreqItems = showMoreBoughtTogether
    ? frequentlyBoughtTogetherList
    : frequentlyBoughtTogetherList.slice(0, 2);

  // Suggested Products for Grid Section
  const suggestedProducts = (restaurantMenuItems && restaurantMenuItems.length > 0
    ? restaurantMenuItems.filter((i) => i.id !== itemId).slice(0, 4)
    : []
  );

  // Live Price Calculations (UI PREVIEW ONLY: Display-only feedback before adding to cart. Authoritative totals are re-computed server-side in integer cents.)
  const basePriceCents = toCents(basePrice);
  const addonsTotalCents = Object.values(selectedAddonPrices).reduce((a, b) => a + toCents(b), 0);
  const freqTotalCents = Object.values(selectedFreqPrices).reduce((a, b) => a + toCents(b), 0);
  const unitPriceCents = basePriceCents + addonsTotalCents + freqTotalCents;
  const totalPriceCents = unitPriceCents * quantity;
  const totalPrice = fromCents(totalPriceCents);
  const currencySymbol = getCurrencySymbol(itemData?.currency || restaurantData?.currency);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Toggle Addon Option Selection
  const toggleAddonOption = (optId: string, price: number) => {
    if (selectedAddonOptionIds.includes(optId)) {
      setSelectedAddonOptionIds((prev) => prev.filter((id) => id !== optId));
      setSelectedAddonPrices((prev) => {
        const next = { ...prev };
        delete next[optId];
        return next;
      });
    } else {
      setSelectedAddonOptionIds((prev) => [...prev, optId]);
      setSelectedAddonPrices((prev) => ({ ...prev, [optId]: price }));
    }
  };

  // Toggle Frequently Bought Together Item Selection
  const toggleFreqItem = (freqId: string, price: number) => {
    if (selectedFreqItemIds.includes(freqId)) {
      setSelectedFreqItemIds((prev) => prev.filter((id) => id !== freqId));
      setSelectedFreqPrices((prev) => {
        const next = { ...prev };
        delete next[freqId];
        return next;
      });
    } else {
      setSelectedFreqItemIds((prev) => [...prev, freqId]);
      setSelectedFreqPrices((prev) => ({ ...prev, [freqId]: price }));
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    const { addToCart, fetchCart } = useCartStore.getState();

    // Full Instructions including unavailability choice if customized
    const fullInstructions = [
      instructions.trim(),
      unavailableAction !== UNAVAILABLE_OPTIONS[0] ? `[If unavailable: ${unavailableAction}]` : "",
    ]
      .filter(Boolean)
      .join(" ");

    // 1. Add Main Item with selected Add-on Option IDs
    const mainSuccess = await addToCart({
      menuItemId: itemId,
      quantity,
      selectedAddonOptionIds,
      specialInstructions: fullInstructions,
      restaurantId,
      restaurantName,
      itemName: title,
      itemImage: image,
      itemPrice: basePrice,
    });

    // 2. Add Selected Frequently Bought Together Items
    if (selectedFreqItemIds.length > 0) {
      for (const freqId of selectedFreqItemIds) {
        try {
          await addToCart({
            menuItemId: freqId,
            quantity: 1,
            restaurantId,
            restaurantName,
            itemPrice: selectedFreqPrices[freqId] || 0,
          });
        } catch {
          // Ignore individual fallback error
        }
      }
    }

    await fetchCart();

    if (mainSuccess) {
      setAddedToCartToast(true);
      setTimeout(() => setAddedToCartToast(false), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* Cross-Restaurant Conflict Modal */}
      <CartConflictModal />

      {/* Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="restaurant" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-10 flex-1">
        {/* Toast Notification */}
        {addedToCartToast && (
          <div className="fixed bottom-8 right-8 bg-[#2B1B0E] text-[#FCBA08] font-poppins font-bold px-6 py-3.5 rounded-2xl shadow-2xl z-50 transition-all flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <svg className="w-5 h-5 fill-current text-[#FCBA08]" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <span>Added to Cart successfully!</span>
          </div>
        )}

        {/* HERO COMPACT 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Compact Sticky Image Card */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
            <div className="w-full max-w-[380px] mx-auto aspect-square rounded-[24px] border border-gray-200/80 bg-white p-5 flex items-center justify-center shadow-xs relative overflow-hidden group">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={image}
                  alt={title}
                  width={340}
                  height={340}
                  className="w-full h-auto max-h-[320px] object-contain select-none drop-shadow-md transition-transform group-hover:scale-105 duration-300"
                  priority
                  unoptimized={image.startsWith("data:")}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Title, Stepper, Add-ons, Frequently Bought & Special Instructions */}
          <div className="lg:col-span-7 flex flex-col justify-start items-start text-left gap-6">
            
            {/* 1. TITLE & PRICE HEADER */}
            <div className="w-full flex flex-col gap-1.5 border-b border-gray-100 pb-4">
              <h1 className="font-mali uppercase text-[26px] sm:text-[32px] font-bold text-[#2B1B0E] tracking-tight leading-tight select-none">
                {title}
              </h1>
              <div className="flex items-center gap-3 font-poppins">
                <span className="text-[#2B1B0E] font-extrabold text-base sm:text-lg">
                  from {currencySymbol}{basePrice.toFixed(2)}
                </span>
                <span className="text-gray-400 text-xs font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">
                  Single serving
                </span>
              </div>
              <p className="font-poppins text-gray-600 text-xs sm:text-sm leading-relaxed mt-1">
                {description}
              </p>
            </div>

            {/* 3. ADD-ONS SECTION */}
            {addonGroups.map((group) => (
              <div key={group.id} className="w-full flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-mali uppercase text-sm font-bold text-[#2B1B0E] tracking-tight">
                    {group.title || "ADD-ONS"}
                  </h3>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-poppins font-medium ${
                      group.isRequired
                        ? "bg-amber-100 text-amber-800 font-semibold"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {group.isRequired ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {group.options.map((opt) => {
                    const isSelected = selectedAddonOptionIds.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleAddonOption(opt.id, opt.price)}
                        className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl border transition-all cursor-pointer group ${
                          isSelected
                            ? "border-[#FCBA08] bg-amber-50/40"
                            : "border-gray-200/90 bg-white hover:border-amber-300"
                        }`}
                      >
                        <span className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                          {opt.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-poppins text-xs text-gray-500 font-medium">
                            + {currencySymbol}{opt.price.toFixed(2)}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-[#FCBA08] bg-[#FCBA08]"
                                : "border-gray-300 group-hover:border-gray-400"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#2B1B0E]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 4. FREQUENTLY BOUGHT TOGETHER SECTION */}
            <div className="w-full flex flex-col gap-2.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-mali uppercase text-sm font-bold text-[#2B1B0E] tracking-tight">
                  FREQUENTLY BOUGHT TOGETHER
                </h3>
                <span className="bg-gray-100 text-gray-500 text-[11px] px-2.5 py-0.5 rounded-full font-poppins font-medium">
                  Optional
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full">
                {visibleFreqItems.map((item) => {
                  const isSelected = selectedFreqItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleFreqItem(item.id, item.price)}
                      className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? "border-[#FCBA08] bg-amber-50/40"
                          : "border-gray-200/90 bg-white hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 p-0.5">
                          <Image
                            src={item.image || "/item1.png"}
                            alt={item.name}
                            fill
                            className="object-contain"
                            unoptimized={item.image?.startsWith("data:")}
                          />
                        </div>
                        <span className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-poppins text-xs font-bold text-gray-600">
                          + {currencySymbol}{item.price.toFixed(2)}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-[#FCBA08] bg-[#FCBA08]"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#2B1B0E]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {frequentlyBoughtTogetherList.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowMoreBoughtTogether(!showMoreBoughtTogether)}
                  className="font-poppins text-[11px] font-semibold text-gray-700 hover:text-[#2B1B0E] flex items-center gap-1 focus:outline-none self-start transition-colors mt-0.5"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showMoreBoughtTogether ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>
                    {showMoreBoughtTogether
                      ? "Show less"
                      : `View ${frequentlyBoughtTogetherList.length - 2} more`}
                  </span>
                </button>
              )}
            </div>

            {/* 5. SPECIAL INSTRUCTIONS SECTION */}
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-gray-100">
              <h3 className="font-mali uppercase text-sm font-bold text-[#2B1B0E] tracking-tight">
                SPECIAL INSTRUCTIONS
              </h3>
              <p className="font-poppins text-gray-500 text-[11px]">
                Please let us know if you are allergic to anything or if we need to avoid anything
              </p>

              <div className="w-full relative">
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
                  placeholder="e.g. no mayo, extra sauce"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 font-poppins text-xs text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 resize-none transition-all"
                />
                <span className="absolute bottom-2.5 right-3 font-poppins text-[10px] font-medium text-gray-400 select-none">
                  {instructions.length}/500
                </span>
              </div>
            </div>

            {/* 6. IF THIS PRODUCT IS NOT AVAILABLE (COMPACT SELECTOR) */}
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-gray-100">
              <h3 className="font-mali uppercase text-sm font-bold text-[#2B1B0E] tracking-tight">
                IF THIS PRODUCT IS NOT AVAILABLE
              </h3>

              <div className="w-full relative">
                <div
                  onClick={() => setIsUnavailableDropdownOpen(!isUnavailableDropdownOpen)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 font-poppins text-xs font-semibold text-[#1A1A1A] flex items-center justify-between cursor-pointer shadow-2xs hover:border-[#FCBA08] transition-all select-none"
                >
                  <span>{unavailableAction}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isUnavailableDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isUnavailableDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden font-poppins text-xs">
                    {UNAVAILABLE_OPTIONS.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setUnavailableAction(opt);
                          setIsUnavailableDropdownOpen(false);
                        }}
                        className={`p-3 cursor-pointer hover:bg-amber-50 transition-colors flex items-center justify-between ${
                          unavailableAction === opt ? "bg-amber-50/70 font-bold text-[#2B1B0E]" : "text-gray-700"
                        }`}
                      >
                        <span>{opt}</span>
                        {unavailableAction === opt && (
                          <svg className="w-3.5 h-3.5 text-[#2B1B0E] fill-current" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. QUANTITY STEPPER & MAIN ADD TO CART BUTTON */}
            <div className="w-full flex flex-wrap items-center gap-4 bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl mt-2">
              <div className="flex items-center justify-between w-[130px] h-[42px] rounded-xl border border-gray-200 bg-white px-2.5 shadow-2xs select-none">
                <button
                  type="button"
                  onClick={decrementQty}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base font-bold transition-all focus:outline-none"
                >
                  -
                </button>
                <span className="font-poppins font-bold text-[#1A1A1A] text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQty}
                  aria-label="Increase quantity"
                  className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base font-bold transition-all focus:outline-none"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 min-w-[200px] h-[44px] px-5 rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between gap-3 focus:outline-none select-none"
              >
                <span>Add to cart</span>
                <span className="bg-[#2B1B0E] text-[#FCBA08] text-xs px-2.5 py-1 rounded-lg">
                  {currencySymbol}{totalPrice.toFixed(2)}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* HORIZONTAL DIVIDER LINE */}
        <div className="w-full h-[1px] bg-gray-100 my-12 sm:my-16" />

        {/* SUGGESTED FOR YOU SECTION */}
        <div className="flex flex-col gap-6">
          <h2 className="font-mali uppercase text-[24px] sm:text-[28px] font-bold text-[#2B1B0E] tracking-tight">
            SUGGESTED FOR YOU
          </h2>

          {/* Dynamic 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedProducts.map((item) => {
              const suggestedQty = getItemQuantity(item.id);
              return (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Food Image */}
                  <div className="relative w-full aspect-square flex items-center justify-center mb-4">
                    <Image
                      src={item.image || "/item1.png"}
                      alt={item.name}
                      width={240}
                      height={240}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      unoptimized={item.image?.startsWith("data:")}
                    />
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="font-poppins text-sm font-semibold text-gray-800 line-clamp-1">
                        {item.name}
                      </span>
                      <span className="font-poppins text-sm sm:text-base font-bold text-[#1A1A1A]">
                        {currencySymbol}{typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                      </span>
                    </div>

                    {/* Add Button Circle */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center shadow-sm transition-all relative ${
                        suggestedQty > 0
                          ? "bg-[#2B1B0E] text-[#FCBA08] border-[#2B1B0E]"
                          : "bg-white text-gray-700 group-hover:bg-[#FCBA08] group-hover:border-[#FCBA08] group-hover:text-[#2B1B0E]"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 stroke-[2]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>

                      {/* Product Count Badge */}
                      {suggestedQty > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#FCBA08] text-[#2B1B0E] border-2 border-white text-[11px] font-extrabold font-poppins flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                          {suggestedQty}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Section Divider mascot */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-8 sm:mt-10 select-none">
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
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#FCBA08] py-4 px-6 text-center select-none">
        <p className="font-poppins text-xs sm:text-sm text-[#2B1B0E] font-semibold tracking-normal">
          © 2026 Food Menia All rights reserved.
        </p>
      </footer>
    </div>
  );
}
