"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socketClient";

interface Order {
  id: number;
  status: string;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount_amount: number;
  total: number;
  fulfillment_type: string;
  delivery_instructions?: string;
  placed_at: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  assigned_rider_id?: number | null;
  rider_name?: string | null;
  rider_phone?: string | null;
}

interface RestaurantOrdersTabProps {
  restaurantId?: number;
}

const statusOptions = [
  { label: "All Orders", value: "" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivering", value: "delivering" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function RestaurantOrdersTab({ restaurantId }: RestaurantOrdersTabProps) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["owner-orders", selectedStatus],
    queryFn: () =>
      apiClient.get<Order[]>(
        selectedStatus
          ? `/restaurant-owner/orders?status=${selectedStatus}`
          : "/restaurant-owner/orders"
      ),
    refetchInterval: 10000, // Poll every 10 seconds as backup
  });

  // Socket.IO real-time order tracking for restaurant owner
  useEffect(() => {
    if (!restaurantId) return;

    const socket = getSocket();
    socket.emit("joinRestaurant", { restaurantId });

    const handleStatusUpdate = () => {
      // Invalidate queries so fresh order data (including rider info & status) is refetched immediately
      queryClient.invalidateQueries({ queryKey: ["owner-orders"] });
    };

    socket.on("order:statusUpdate", handleStatusUpdate);

    return () => {
      socket.emit("leaveRestaurant", { restaurantId });
      socket.off("order:statusUpdate", handleStatusUpdate);
    };
  }, [restaurantId, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiClient.patch(`/restaurant-owner/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-orders"] });
    },
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "placed":
      case "preparing":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "ready":
        return "bg-[#FCBA08]/20 text-[#2B1B0E] border-[#FCBA08]";
      case "delivering":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "delivered":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "cancelled":
        return "bg-red-100 text-red-900 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelectedStatus(opt.value)}
            className={`px-4 py-2 rounded-xl font-poppins text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === opt.value
                ? "bg-[#2B1B0E] text-[#FCBA08] shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <div className="w-8 h-8 border-3 border-[#FCBA08] border-t-transparent rounded-full animate-spin mb-1" />
          <span className="font-poppins text-xs">Loading order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center flex flex-col items-center gap-3 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl text-amber-700">
            📦
          </div>
          <h3 className="font-mali text-xl font-bold text-[#2B1B0E]">No orders found</h3>
          <p className="font-poppins text-xs text-gray-500 max-w-sm">
            There are currently no orders matching the selected status filter.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const hasRider = Boolean(order.assigned_rider_id || order.rider_name);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-sm flex flex-col gap-4 transition-all"
              >
                {/* Top Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-[#1A1A1A] bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                      #{order.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-poppins font-bold border uppercase tracking-wider ${getStatusBadgeStyle(
                        order.status
                      )}`}
                    >
                      {order.status === "placed" ? "preparing" : order.status}
                    </span>
                    <span className="font-poppins text-xs text-gray-400 font-medium">
                      {new Date(order.placed_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-poppins font-extrabold text-lg text-[#2B1B0E]">
                      ${Number(order.total).toFixed(2)}
                    </span>

                    {/* Status Update Control */}
                    <select
                      value={order.status === "placed" ? "preparing" : order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          orderId: order.id,
                          status: e.target.value,
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-poppins text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
                    >
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready for Pickup</option>
                      <option value="delivering">Delivering</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-gray-400 hover:text-gray-700 text-xs font-poppins font-semibold px-2 py-1 transition-colors"
                    >
                      {isExpanded ? "▲ Hide Details" : "▼ Details"}
                    </button>
                  </div>
                </div>

                {/* Scannable Metadata Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 font-poppins text-xs">
                  {/* Customer Info Box */}
                  <div className="flex flex-col bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</span>
                    <span className="font-semibold text-gray-800 truncate">{order.user_name}</span>
                    <span className="text-gray-500 text-[11px] truncate">{order.user_email}</span>
                  </div>

                  {/* Rider Info Box */}
                  <div className="flex flex-col bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Rider</span>
                    {hasRider ? (
                      <span className="font-bold text-emerald-800 truncate">
                        🛵 {order.rider_name} {order.rider_phone ? `(${order.rider_phone})` : ""}
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 truncate">
                        🛵 Waiting for rider...
                      </span>
                    )}
                  </div>

                  {/* Fulfillment Type Box */}
                  <div className="flex flex-col bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Fulfillment</span>
                    <span className="font-bold text-[#1A1A1A] capitalize flex items-center gap-1">
                      {order.fulfillment_type === "delivery" ? "📦 Doorstep Delivery" : "🏃 Store Pickup"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="bg-gray-50/90 rounded-2xl p-4 text-xs font-poppins flex flex-col gap-3 border border-gray-200/70 animate-in fade-in duration-150">
                    {order.delivery_instructions && (
                      <div className="text-amber-900 bg-amber-50/90 p-3 rounded-xl border border-amber-200/80">
                        💬 <strong>Delivery Instructions:</strong> {order.delivery_instructions}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-gray-600 font-medium pt-1 gap-2">
                      <span>Subtotal: ${Number(order.subtotal).toFixed(2)}</span>
                      <span>Delivery Fee: ${Number(order.delivery_fee).toFixed(2)}</span>
                      <span>Platform Fee: ${Number(order.platform_fee).toFixed(2)}</span>
                      {Number(order.discount_amount) > 0 && (
                        <span className="text-emerald-600 font-bold">
                          Discount: -${Number(order.discount_amount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
