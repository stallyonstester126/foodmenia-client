"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socketClient";

interface OrderTrackingProps {
  orderId?: string;
  initialStatus?: "preparing" | "dispatched" | "delivered" | "cancelled";
}

interface ChatMessage {
  id: string;
  sender: "user" | "rider";
  text: string;
  timestamp: string;
}

export default function OrderTrackingSection({
  orderId: propOrderId,
  initialStatus = "preparing",
}: OrderTrackingProps) {
  const searchParams = useSearchParams();
  const orderId = propOrderId || searchParams.get("orderId") || "ord_101";

  const [status, setStatus] = useState<"preparing" | "dispatched" | "delivered" | "cancelled">(
    initialStatus
  );
  const [estimatedTime, setEstimatedTime] = useState("15-20 mins");
  const [deliveryAddress, setDeliveryAddress] = useState("B1234 Maple Street, Austin, TX 78701");
  const [riderName, setRiderName] = useState("Searching for rider...");

  // Chat drawer state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "rider", text: "Hello! I am on my way with your order.", timestamp: "12:30 PM" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const applyStatusUpdate = (rawStatusStr?: string) => {
    if (!rawStatusStr) return;
    const raw = String(rawStatusStr).toLowerCase().trim();
    if (raw === "delivering" || raw.includes("on_the_way") || raw.includes("dispatch")) {
      setStatus("dispatched");
    } else if (raw === "delivered") {
      setStatus("delivered");
    } else if (raw === "cancelled") {
      setStatus("cancelled");
    } else {
      setStatus("preparing");
    }
  };

  // 1. Initial REST API Fetch
  useEffect(() => {
    async function fetchTracking() {
      try {
        const data = await apiClient.get<{
          status?: string;
          estimated_delivery_min?: number;
          estimated_delivery_max?: number;
          delivery_address?: string;
          delivery_lat?: number;
          delivery_lng?: number;
          restaurant_name?: string;
          restaurant_address?: string;
          restaurant_lat?: number;
          restaurant_lng?: number;
          rider_name?: string;
          riderName?: string;
          deliveryAddress?: string;
          estimatedTime?: string;
        }>(`/orders/${orderId}/track`);

        if (data) {
          if (data.status) applyStatusUpdate(data.status);
          if (data.estimated_delivery_min && data.estimated_delivery_max) {
            setEstimatedTime(`${data.estimated_delivery_min}-${data.estimated_delivery_max} mins`);
          } else if (data.estimatedTime) {
            setEstimatedTime(data.estimatedTime);
          }
          if (data.delivery_address || data.deliveryAddress) {
            setDeliveryAddress(data.delivery_address || data.deliveryAddress || "");
          }

          const name = data.rider_name || data.riderName;
          if (name && name !== "Pending Assignment") {
            setRiderName(name);
          } else {
            setRiderName("Searching for rider...");
          }
        }
      } catch {
        // Fallback to default
      }
    }
    fetchTracking();
  }, [orderId]);

  // 2. Real-Time Socket.IO Subscriptions
  useEffect(() => {
    const socket = getSocket();

    socket.emit("joinOrder", { orderId: String(orderId) });
    socket.emit("join:order", { orderId: String(orderId) });

    const handleStatusPayload = (data: {
      orderId?: string | number;
      status?: string;
      estimatedTime?: string;
      riderName?: string;
      rider_name?: string;
    }) => {
      if (!data) return;
      if (!data.orderId || String(data.orderId) === String(orderId)) {
        if (data.status) applyStatusUpdate(data.status);
        if (data.estimatedTime) setEstimatedTime(data.estimatedTime);
        const name = data.riderName || data.rider_name;
        if (name && name !== "Pending Assignment") {
          setRiderName(name);
        }
      }
    };

    socket.on("order:statusUpdate", handleStatusPayload);
    socket.on("order:status_updated", handleStatusPayload);

    socket.on("chat:message_received", (msg: { orderId?: string; sender?: "user" | "rider"; text: string }) => {
      if (!msg.orderId || String(msg.orderId) === String(orderId)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            sender: msg.sender || "rider",
            text: msg.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    });

    return () => {
      socket.off("order:statusUpdate", handleStatusPayload);
      socket.off("order:status_updated", handleStatusPayload);
      socket.off("chat:message_received");
    };
  }, [orderId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage("");

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);

    const socket = getSocket();
    socket.emit("chat:message", { orderId, text });
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="restaurant" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* YOUR ORDER HEADER TITLE & HELP BUTTON */}
        <div className="flex items-center justify-between select-none mb-10">
          <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E]">
            YOUR ORDER
          </h1>

          <button
            type="button"
            className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-6 py-2 rounded-lg shadow-sm transition-all focus:outline-none"
          >
            Help
          </button>
        </div>



        {/* ESTIMATED DELIVERY TIME */}
        <div className="flex flex-col items-center justify-center text-center select-none">
          <span className="font-poppins text-sm text-gray-500 font-medium mb-1">
            Estimated time of delivery
          </span>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#1A1A1A] mb-8">
            {estimatedTime}
          </h2>

          {/* DYNAMIC STATUS IMAGE (preparing.png vs dispatch.png) */}
          <div className="relative w-[280px] h-[240px] sm:w-[360px] sm:h-[300px] mb-8 flex items-center justify-center">
            {status === "preparing" ? (
              <Image
                src="/preparing.png"
                alt="Preparing your order"
                fill
                className="object-contain drop-shadow-md transition-all duration-500"
                priority
              />
            ) : (
              <Image
                src="/dispatch.png"
                alt="Order on the way"
                fill
                className="object-contain drop-shadow-md transition-all duration-500"
                priority
              />
            )}
          </div>

          {/* PROGRESS SEGMENTS INDICATOR */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[320px] sm:max-w-[400px] mb-4 select-none">
            <div className={`h-2 flex-1 rounded-full ${status !== "cancelled" ? "bg-[#FCBA08]" : "bg-gray-200"}`} />
            <div className={`h-2 flex-1 rounded-full ${status === "preparing" || status === "dispatched" || status === "delivered" ? "bg-[#FCBA08]" : "bg-gray-200"}`} />
            <div className={`h-2 flex-1 rounded-full ${status === "dispatched" || status === "delivered" ? "bg-[#FCBA08]" : "bg-gray-200"}`} />
            <div className={`h-2 flex-1 rounded-full ${status === "delivered" ? "bg-[#FCBA08]" : "bg-gray-200"}`} />
          </div>

          {/* STATUS LABEL */}
          <h3 className="font-poppins font-bold text-lg sm:text-xl text-[#1A1A1A] mb-10">
            {status === "preparing"
              ? "Preparing your order"
              : status === "dispatched"
              ? "Your order is on the way!"
              : status === "delivered"
              ? "Order Delivered! Enjoy your meal!"
              : "Order Cancelled"}
          </h3>
        </div>

        {/* INFO CARDS SECTION */}
        <div className="flex flex-col gap-5 max-w-[850px] mx-auto">
          {/* CARD 1: CONTACT YOUR RIDER */}
          <div className="w-full rounded-[20px] border border-gray-200/80 bg-white p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 relative rounded-full overflow-hidden flex-shrink-0 bg-[#FCBA08]/20 flex items-center justify-center">
                <Image
                  src="/rider.png"
                  alt="Rider"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm sm:text-base text-[#1A1A1A]">
                  Contact your rider ({riderName})
                </span>
                <span className="font-poppins text-xs text-gray-400">
                  Tap to chat with rider in real-time
                </span>
              </div>
            </div>

            {/* Chat Icon Button */}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Contact rider"
              className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-[#FCBA08] text-[#FCBA08] hover:text-[#2B1B0E] flex items-center justify-center transition-all focus:outline-none select-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* CARD 2: DELIVERY DETAILS */}
          <div className="w-full rounded-[20px] border border-gray-200/80 bg-white p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-[#FCBA08]">
                <svg className="w-6 h-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-poppins font-semibold text-sm sm:text-base text-[#1A1A1A]">
                  Delivery details
                </span>
                <span className="font-poppins text-xs text-gray-500 truncate max-w-[280px] sm:max-w-[440px]">
                  {deliveryAddress}
                </span>
                <span className="font-poppins text-[11px] text-gray-400 mt-0.5">
                  Delivered by <strong className="text-gray-700">{riderName}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RIDER CHAT DRAWER */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end select-none">
          <div className="w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Chat Header */}
            <div className="bg-[#FCBA08] p-4 flex items-center justify-between text-[#2B1B0E]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 relative rounded-full overflow-hidden bg-white/40">
                  <Image src="/rider.png" alt="Rider" width={36} height={36} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm">{riderName}</h4>
                  <span className="font-poppins text-xs text-[#2B1B0E]/80">Your Delivery Rider</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold text-[#2B1B0E] hover:bg-white/50"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] p-3 rounded-2xl font-poppins text-xs ${
                    m.sender === "user"
                      ? "bg-[#FCBA08] text-[#2B1B0E] font-medium self-end rounded-br-none"
                      : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-60 mt-1 block text-right">{m.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to rider..."
                className="flex-1 rounded-xl border border-gray-200 p-2.5 font-poppins text-xs focus:outline-none focus:ring-2 focus:ring-[#FCBA08]"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#e5a807]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-[#FCBA08] py-4 px-6 text-center select-none">
        <p className="font-poppins text-xs sm:text-sm text-[#2B1B0E] font-semibold tracking-normal">
          © 2026 Food Menia All rights reserved.
        </p>
      </footer>
    </div>
  );
}
