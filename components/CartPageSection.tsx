"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/lib/cartStore";
import CartConflictModal from "@/components/cart/CartConflictModal";
import { getCurrencySymbol } from "@/lib/formatters";

export default function CartPageSection() {
  const {
    cart,
    fetchCart,
    updateQuantity,
    removeItem,
    updateFulfillment,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartItems = cart?.items || [];
  const currencySymbol = getCurrencySymbol(cart?.currency);
  const deliveryMode = cart?.fulfillmentType || "delivery";
  const deliveryTime = cart?.deliveryEstimate || "40-60 min";
  const subtotal = cart?.subtotal || 0;
  const platformFee = cart?.platformFee || 19.99;
  const grandTotal = cart?.grandTotal || subtotal + platformFee;



  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="restaurant" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* CART HEADER TITLE */}
        <div className="flex items-center gap-4 select-none mb-8">
          <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E]">
            CART
          </h1>
          {cartItems.length > 0 && cart?.restaurantName && (
            <>
              <span className="text-gray-300 text-2xl font-light">|</span>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex-shrink-0">
                  <Image
                    src={
                      cart?.restaurantProfileImage ||
                      cart?.restaurantCoverImage ||
                      "/ResturantHero.png"
                    }
                    alt={cart?.restaurantName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-poppins text-lg sm:text-xl font-semibold text-gray-800">
                  {cart?.restaurantName}
                </span>
              </div>
            </>
          )}
        </div>

      {/* Conflict Modal */}
      <CartConflictModal />

      {/* DELIVERY / PICKUP TOGGLE TABS */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-4 select-none">
        <button
          type="button"
          onClick={() => updateFulfillment("delivery")}
          className={`font-poppins text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors focus:outline-none ${
            deliveryMode === "delivery"
              ? "text-[#2B1B0E] border-b-2 border-[#2B1B0E] pb-4 -mb-[18px]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>🛵</span>
          <span>Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => updateFulfillment("pickup")}
          className={`font-poppins text-sm sm:text-base font-medium flex items-center gap-2 transition-colors focus:outline-none ${
            deliveryMode === "pickup"
              ? "text-[#2B1B0E] font-semibold border-b-2 border-[#2B1B0E] pb-4 -mb-[18px]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>🏃</span>
          <span>Pick-up</span>
        </button>
      </div>

      {/* DELIVERY TIME ESTIMATE BAR */}
      <div className="flex items-center justify-between py-6 border-b border-gray-100">
        <div className="font-poppins text-sm sm:text-base text-[#1A1A1A]">
          <span className="font-normal text-gray-600">Delivery: </span>
          <span className="font-bold">{deliveryTime}</span>
        </div>
      </div>

      {/* CART ITEMS LIST */}
      <div className="flex flex-col">
        {cartItems.length === 0 ? (
          <div className="py-12 text-center font-poppins text-gray-400 text-sm">
            Your cart is empty. Add some delicious meals!
          </div>
        ) : (
          cartItems.map((item) => {
            const itemAddonsTotal = (item.selectedOptions || []).reduce((sum, opt) => sum + opt.price, 0);
            const itemRowTotal = (item.price + itemAddonsTotal) * item.quantity;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center py-6 border-b border-gray-100 gap-4"
              >
                {/* Col 1: Thumbnail, Name, Selected Addons & Instructions */}
                <div className="col-span-5 sm:col-span-4 flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                    <Image
                      src={item.image || "/item1.png"}
                      alt={item.name}
                      fill
                      className="object-contain drop-shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-poppins font-semibold text-sm sm:text-base text-[#1A1A1A] truncate">
                      {item.name}
                    </span>

                    {/* Selected Add-ons Pills */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedOptions.map((opt, idx) => (
                          <span
                            key={opt.id || idx}
                            className="bg-amber-100/70 text-amber-900 text-[10px] font-poppins font-semibold px-2 py-0.5 rounded-full"
                          >
                            + {opt.name} {opt.price > 0 ? `(${currencySymbol}${opt.price})` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className="font-poppins text-[11px] text-gray-500 italic mt-0.5 truncate">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Col 2: Quantity Stepper Box */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-center">
                  <div className="flex items-center justify-between w-[110px] sm:w-[130px] h-[38px] sm:h-[44px] rounded-xl border border-gray-200 bg-white px-3 shadow-sm select-none">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base font-bold transition-all focus:outline-none"
                    >
                      -
                    </button>
                    <span className="font-poppins font-bold text-[#1A1A1A] text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base font-bold transition-all focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Col 3: Price */}
                <div className="col-span-2 sm:col-span-3 text-right">
                  <span className="font-poppins font-bold text-sm sm:text-base text-[#1A1A1A]">
                    {currencySymbol}{itemRowTotal.toFixed(2)}
                  </span>
                </div>

                {/* Col 4: Remove Button */}
                <div className="col-span-2 sm:col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs px-4 sm:px-5 py-2 rounded-lg shadow-sm transition-all focus:outline-none select-none"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* ADD MORE ITEMS BUTTON */}
        <div className="mt-6">
          <Link
            href="/menu"
            className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 select-none"
          >
            <span>+</span>
            <span>Add more items</span>
          </Link>
        </div>


        {/* SECTION 2: ORDER SUMMARY CARD */}
        <div className="mt-10 sm:mt-14 w-full rounded-[24px] border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          {/* Subtotal Row */}
          <div className="flex items-center justify-between font-poppins">
            <span className="font-bold text-sm sm:text-base text-[#1A1A1A]">
              Subtotal
            </span>
            <span className="font-bold text-sm sm:text-base text-[#1A1A1A]">
              {currencySymbol}{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="w-full h-[1px] bg-gray-100" />

          {/* Standard Delivery Row */}
          <div className="flex items-center justify-between font-poppins text-xs sm:text-sm">
            <span className="text-gray-600">
              Standard delivery You&apos;ve got free delivery
            </span>
            <span className="font-semibold text-[#5C320F]">Free</span>
          </div>

          <div className="w-full h-[1px] bg-gray-100" />

          {/* Platform Fee Row */}
          <div className="flex items-center justify-between font-poppins text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span>Platform Fee</span>
              <svg
                className="w-4 h-4 text-gray-400 stroke-[2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <span className="font-medium text-[#1A1A1A]">
              {currencySymbol}{platformFee.toFixed(2)}
            </span>
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between font-poppins mt-2">
            <span className="font-bold text-sm sm:text-base text-[#1A1A1A]">
              Total <span className="text-xs text-gray-400 font-normal">(incl. fees and tax)</span>
            </span>
            <span className="font-mali font-bold text-base sm:text-lg text-[#381A05]">
              {currencySymbol}{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Confirm Payment and Address Button */}
          <Link
            href="/checkout"
            className="w-full h-[50px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center cursor-pointer mt-3 select-none"
          >
            Confirm payment and address
          </Link>
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
