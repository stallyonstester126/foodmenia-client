"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function CartToast() {
  const { toast, hideToast } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(hideToast, 300); // Wait for fade out animation
      }, 3200);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] transition-all duration-300 transform select-none ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-[#2B1B0E] text-white rounded-2xl p-4 sm:p-4 pr-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-amber-500/30 flex items-center gap-3.5 max-w-[360px] sm:max-w-[400px] relative overflow-hidden group">
        {/* Animated Progress Bar at Bottom */}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-[#FCBA08] transition-all duration-[3200ms] ease-linear"
          style={{ width: isVisible ? "100%" : "0%" }}
        />

        {/* Product Image or Success Icon */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/15">
          {toast.itemImage ? (
            <Image
              src={toast.itemImage}
              alt={toast.itemName || "Product"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#FCBA08] text-[#2B1B0E] flex items-center justify-center font-bold text-sm">
              ✓
            </div>
          )}
        </div>

        {/* Message & Item Name */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-poppins text-xs font-bold text-[#FCBA08] uppercase tracking-wider">
              Product Added!
            </span>
          </div>
          <span className="font-poppins text-sm font-semibold text-white truncate">
            {toast.itemName || "Item added to your cart"}
          </span>
        </div>

        {/* View Cart Link Button */}
        <Link
          href="/cart"
          onClick={() => hideToast()}
          className="px-3 py-1.5 rounded-lg bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins text-xs font-bold shadow-sm transition-all flex-shrink-0 hover:scale-105 active:scale-95"
        >
          View Cart
        </Link>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            setTimeout(hideToast, 300);
          }}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition-all focus:outline-none -mr-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
