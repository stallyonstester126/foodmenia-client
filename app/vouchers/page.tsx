"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useVouchers } from "@/lib/useUserData";

export default function VouchersPage() {
  const { data: vouchers, isLoading } = useVouchers();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-6">
          YOUR VOUCHERS
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-[24px] animate-pulse" />
              ))
            : (vouchers || []).map((voucher) => (
                <div
                  key={voucher.id}
                  className="w-full rounded-[24px] border-2 border-dashed border-[#FCBA08] bg-amber-50/50 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <span className="font-mali text-xl font-bold text-[#2B1B0E]">
                      {voucher.code}
                    </span>
                    <span className="font-poppins text-xs text-gray-500 mt-1">
                      {voucher.description || `Get ${voucher.discountAmount}${voucher.discountType === "percent" ? "%" : " Rs."} OFF`}
                    </span>
                    <span className="font-poppins text-[10px] text-gray-400 mt-1">
                      Min spend: Rs. {voucher.minSpend}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(voucher.code)}
                    className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs px-4 py-2 rounded-xl transition-all focus:outline-none select-none"
                  >
                    {copiedCode === voucher.code ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              ))}
        </div>
      </main>

      <footer className="w-full bg-[#FCBA08] py-4 px-6 text-center select-none">
        <p className="font-poppins text-xs sm:text-sm text-[#2B1B0E] font-semibold tracking-normal">
          © 2026 Food Menia All rights reserved.
        </p>
      </footer>
    </div>
  );
}
