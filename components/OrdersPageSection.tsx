"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { usePastOrders } from "@/lib/useUserData";
import { apiClient } from "@/lib/apiClient";
import { useCartStore } from "@/lib/cartStore";
import { getCurrencySymbol } from "@/lib/formatters";

export default function OrdersPageSection() {
  const router = useRouter();
  const { data: ordersData = [], isLoading } = usePastOrders();
  const { fetchCart } = useCartStore();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Active statuses: PLACED, PREPARING, READY, DELIVERING
  const activeOrders = ordersData.filter((o) =>
    ["PLACED", "PREPARING", "READY", "DELIVERING"].includes(o.status)
  );

  // Past statuses: DELIVERED, CANCELLED
  const pastOrders = ordersData.filter((o) =>
    ["DELIVERED", "CANCELLED"].includes(o.status) ||
    !["PLACED", "PREPARING", "READY", "DELIVERING"].includes(o.status)
  );

  const handleReorder = async (orderId: string) => {
    setReorderingId(orderId);
    try {
      await apiClient.post(`/orders/${orderId}/reorder`);
      await fetchCart();
      router.push("/cart");
    } catch {
      router.push("/menu");
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLACED":
        return { label: "Order Placed", bg: "bg-blue-100 text-blue-800" };
      case "PREPARING":
        return { label: "Preparing", bg: "bg-amber-100 text-amber-900" };
      case "READY":
        return { label: "Ready for Pickup", bg: "bg-[#FCBA08]/30 text-[#2B1B0E]" };
      case "DELIVERING":
        return { label: "On the Way", bg: "bg-purple-100 text-purple-800" };
      case "DELIVERED":
        return { label: "Delivered", bg: "bg-emerald-100 text-emerald-800" };
      case "CANCELLED":
        return { label: "Cancelled", bg: "bg-red-100 text-red-800" };
      default:
        return { label: status, bg: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* ORDERS HEADER TITLE */}
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-8 select-none">
          ORDERS
        </h1>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="w-full flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="w-full h-40 bg-gray-100 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : ordersData.length === 0 ? (
          /* EMPTY STATE */
          <div className="w-full bg-white rounded-[24px] border border-gray-200/80 p-12 text-center flex flex-col items-center gap-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-4xl shadow-inner">
              🛍️
            </div>
            <h2 className="font-mali text-2xl font-bold text-[#2B1B0E]">No Orders Yet</h2>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 max-w-md">
              You haven&apos;t placed any orders yet. Discover delicious dishes from top local restaurants and get them delivered hot to your doorstep!
            </p>
            <Link
              href="/menu"
              className="mt-2 bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all select-none"
            >
              Browse Restaurants &amp; Menu
            </Link>
          </div>
        ) : (
          <>
            {/* SECTION 1: YOUR ACTIVE ORDERS */}
            {activeOrders.length > 0 && (
              <div className="mb-10 sm:mb-12">
                <div className="inline-block bg-[#FCBA08] text-[#2B1B0E] font-mali uppercase font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm mb-4 select-none">
                  ACTIVE ORDERS ({activeOrders.length})
                </div>

                <div className="flex flex-col gap-6">
                  {activeOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="w-full rounded-[24px] border border-gray-200/80 bg-white p-6 sm:p-7 shadow-sm flex flex-col gap-5 transition-all hover:shadow-md"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 sm:gap-6">
                          <div className="sm:col-span-4 flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm">
                              <Image
                                src={order.restaurantImage || "/item1.png"}
                                alt={order.restaurantName}
                                fill
                                unoptimized={order.restaurantImage?.startsWith("data:") || order.restaurantImage?.startsWith("http")}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-poppins font-bold text-base text-[#1A1A1A] truncate">
                                {order.restaurantName}
                              </span>
                              <span className={`inline-block self-start text-[10px] font-poppins font-bold px-2.5 py-0.5 rounded-full mt-1 ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <span className="font-poppins text-xs sm:text-sm font-medium text-gray-700">
                              {order.itemSummary}
                            </span>
                          </div>

                          <div className="sm:col-span-3">
                            <span className="font-poppins text-xs text-gray-400 font-normal">
                              Placed on {order.createdAt}
                            </span>
                          </div>

                          <div className="sm:col-span-2 sm:text-right">
                            <span className="font-poppins font-bold text-base text-[#1A1A1A]">
                              {getCurrencySymbol(order.currency)}{order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/order-status?orderId=${order.id}`}
                          className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm shadow-sm hover:scale-[1.005] active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                        >
                          Track your order
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: PAST ORDERS */}
            {pastOrders.length > 0 && (
              <div>
                <div className="inline-block bg-gray-100 text-gray-700 font-mali uppercase font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-gray-200 mb-4 select-none">
                  PAST ORDERS ({pastOrders.length})
                </div>

                <div className="flex flex-col gap-6">
                  {pastOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="w-full rounded-[24px] border border-gray-200/80 bg-white p-6 sm:p-7 shadow-sm flex flex-col gap-5 transition-all hover:shadow-md"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 sm:gap-6">
                          <div className="sm:col-span-4 flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm">
                              <Image
                                src={order.restaurantImage || "/item1.png"}
                                alt={order.restaurantName}
                                fill
                                unoptimized={order.restaurantImage?.startsWith("data:") || order.restaurantImage?.startsWith("http")}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-poppins font-bold text-base text-[#1A1A1A] truncate">
                                {order.restaurantName}
                              </span>
                              <span className={`inline-block self-start text-[10px] font-poppins font-bold px-2.5 py-0.5 rounded-full mt-1 ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <span className="font-poppins text-xs sm:text-sm font-medium text-gray-700">
                              {order.itemSummary}
                            </span>
                          </div>

                          <div className="sm:col-span-3">
                            <span className="font-poppins text-xs text-gray-400 font-normal">
                              {order.status === "DELIVERED" ? "Delivered on " : "Date: "}{order.createdAt}
                            </span>
                          </div>

                          <div className="sm:col-span-2 sm:text-right">
                            <span className="font-poppins font-bold text-base text-[#1A1A1A]">
                              {getCurrencySymbol(order.currency)}{order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReorder(order.id)}
                          disabled={reorderingId === order.id}
                          className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm shadow-sm hover:scale-[1.005] active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                        >
                          {reorderingId === order.id ? "Adding to Cart..." : "Reorder items"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
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
