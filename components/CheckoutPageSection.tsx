"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import SavedCardsList from "@/components/payment/SavedCardsList";
import AddCardForm from "@/components/payment/AddCardForm";
import AddressMapModal from "@/components/map/AddressMapModal";
import { useCheckoutStore } from "@/lib/checkoutStore";
import { useCartStore } from "@/lib/cartStore";

export default function CheckoutPageSection() {
  const router = useRouter();
  const {
    addresses,
    selectedAddressId,
    addAddress,
    fetchAddresses,
    deliveryInstructions,
    setDeliveryInstructions,
    leaveAtDoor,
    setLeaveAtDoor,
    voucherApplied,
    voucherError,
    applyVoucher,
    removeVoucher,
    summary,
    fetchSummary,
    placeOrder,
    isSubmitting,
  } = useCheckoutStore();

  const [inputVoucher, setInputVoucher] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [refreshCardsTrigger, setRefreshCardsTrigger] = useState(0);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
    fetchSummary();
  }, [fetchAddresses, fetchSummary]);

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  const formattedAddress = activeAddress
    ? [activeAddress.street, activeAddress.city, activeAddress.state, activeAddress.zipCode].filter(Boolean).join(", ")
    : "B1234 Maple Street, Austin, TX 78701, USA";

  const summaryItems = summary?.items || [];

  const subtotal = summary?.subtotal || 0;
  const platformFee = summary?.platformFee || 0;
  const deliveryFee = summary?.deliveryFee || 0;
  const totalBeforeDiscount = summary?.totalBeforeDiscount || (subtotal + deliveryFee + platformFee);
  const discount = summary?.discount || 0;
  const grandTotal = summary?.grandTotal || 0;

  const handleApplyVoucher = async () => {
    if (!inputVoucher.trim()) return;
    await applyVoucher(inputVoucher.trim());
  };

  const handlePlaceOrder = async () => {
    setPlaceOrderError(null);
    const result = await placeOrder({
      paymentMethodId: selectedPaymentMethodId,
      fulfillmentType: "delivery",
    });

    if (result.success) {
      useCartStore.setState({ cart: null });
      router.push(`/order-status?orderId=${result.orderId}`);
    } else {
      setPlaceOrderError(result.error || "Order placement failed.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="restaurant" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* CHECKOUT HEADER TITLE */}
        <div className="flex items-center gap-3 select-none mb-8">
          <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E]">
            CHECKOUT
          </h1>
          <span className="text-gray-300 text-2xl font-light">|</span>
          <span className="font-poppins text-lg sm:text-xl font-semibold text-gray-700">
            Al Basit Restaurant
          </span>
        </div>

        {/* 1. DELIVERY ADDRESS CARD */}
        <div className="w-full rounded-[24px] border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Top Row: Map Thumbnail + Address Info + Change Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Premium Custom Map Graphic Thumbnail */}
              <div
                onClick={() => setShowMapModal(true)}
                className="w-24 h-20 sm:w-28 sm:h-22 relative rounded-2xl overflow-hidden border border-amber-200/80 shadow-sm flex-shrink-0 bg-amber-50 cursor-pointer group hover:border-[#FCBA08] hover:shadow-md transition-all duration-300 select-none"
                title="Click to select on OpenStreetMap"
              >
                <Image
                  src="/map_preview.jpg"
                  alt="Delivery map view"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Address Labels & Details */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-poppins text-base font-bold text-[#1A1A1A]">
                    {activeAddress?.label || "Home"}
                  </span>
                  {activeAddress?.isDefault && (
                    <span className="bg-[#FCBA08]/20 text-[#2B1B0E] text-[10px] font-poppins font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-poppins text-xs sm:text-sm text-gray-500 line-clamp-2 max-w-lg">
                  {formattedAddress}
                </p>
              </div>
            </div>

            {/* Select On Map Button */}
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl hover:bg-[#e5a807] transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>📍</span> Change Address
            </button>
          </div>

          {/* Leaflet OpenStreetMap Modal */}
          <AddressMapModal
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
            initialAddress={formattedAddress}
            onConfirmAddress={async (newAddr) => {
              await addAddress({ street: newAddr, city: "Austin", full_address: newAddr });
            }}
          />

          {/* Delivery Instructions Input */}
          <div className="w-full flex flex-col gap-1">
            <label className="font-poppins text-xs text-gray-500">
              Delivery instructions/Alternate phone number
            </label>
            <input
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder=""
              className="w-full rounded-[16px] border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
            />
          </div>

          {/* Leave at the door Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-poppins font-semibold text-sm text-[#1A1A1A]">
              Leave at the door
            </span>
            <div
              onClick={() => setLeaveAtDoor(!leaveAtDoor)}
              className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-all select-none ${
                leaveAtDoor ? "bg-[#FCBA08] justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* 2. DELIVERY OPTIONS SECTION */}
        <div className="mt-10 sm:mt-12 flex flex-col gap-4 select-none">
          <h2 className="font-mali uppercase text-[24px] sm:text-[28px] font-bold text-[#2B1B0E] tracking-tight">
            DELIVERY OPTIONS
          </h2>

          <div className="w-full rounded-[16px] border border-gray-200 bg-white p-4 sm:p-5 flex items-center gap-3 shadow-sm cursor-pointer">
            <div className="w-4 h-4 rounded-full border-4 border-[#FCBA08] bg-[#FCBA08] flex-shrink-0" />
            <div className="font-poppins text-sm font-semibold text-[#1A1A1A]">
              Standard <span className="font-normal text-gray-500">20-35 mins</span>
            </div>
          </div>
        </div>

        {/* 3. PAYMENT METHOD SECTION */}
        <div className="mt-10 sm:mt-12 flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <h2 className="font-mali uppercase text-[24px] sm:text-[28px] font-bold text-[#2B1B0E] tracking-tight">
              PAYMENT METHOD
            </h2>
            <button
              type="button"
              onClick={() => setShowAddCardForm(!showAddCardForm)}
              className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>{showAddCardForm ? "Close Form" : "Add new card"}</span>
            </button>
          </div>

          {/* Saved Stripe Cards List */}
          <SavedCardsList
            selectedCardId={selectedPaymentMethodId}
            onSelectCard={(id) => setSelectedPaymentMethodId(id)}
            refreshTrigger={refreshCardsTrigger}
          />

          {/* Inline Add Card Form */}
          {showAddCardForm && (
            <AddCardForm
              onCardAdded={(newId) => {
                setSelectedPaymentMethodId(newId);
                setShowAddCardForm(false);
                setRefreshCardsTrigger((prev) => prev + 1);
              }}
              onCancel={() => setShowAddCardForm(false)}
            />
          )}
        </div>

        {/* 4. VOUCHER SECTION */}
        <div className="mt-10 sm:mt-12 flex flex-col gap-4 select-none">
          <h2 className="font-mali uppercase text-[24px] sm:text-[28px] font-bold text-[#2B1B0E] tracking-tight">
            VOUCHER
          </h2>

          <div className="relative w-full">
            <input
              type="text"
              value={inputVoucher}
              onChange={(e) => setInputVoucher(e.target.value)}
              placeholder="Enter voucher code (e.g. SAVE10)"
              disabled={voucherApplied}
              className="w-full rounded-[16px] border border-gray-200 bg-white p-4 font-poppins text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 shadow-sm transition-all uppercase"
            />
            {inputVoucher && !voucherApplied && (
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#FCBA08] text-[#2B1B0E] font-poppins font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#e5a807]"
              >
                Apply
              </button>
            )}
            {voucherApplied && (
              <button
                type="button"
                onClick={async () => {
                  await removeVoucher();
                  setInputVoucher("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-100 text-red-700 font-poppins font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
          {voucherApplied && (
            <span className="font-poppins text-xs font-semibold text-green-600">
              ✓ Voucher applied successfully!
            </span>
          )}
          {voucherError && (
            <span className="font-poppins text-xs font-semibold text-red-500">
              ⚠️ {voucherError}
            </span>
          )}
        </div>

        {/* 5. ORDER SUMMARY SECTION */}
        <div className="mt-12 sm:mt-16 flex flex-col gap-6 select-none">
          <h2 className="font-mali uppercase text-[26px] sm:text-[30px] font-bold text-[#2B1B0E] tracking-tight">
            ORDER SUMMARY
          </h2>

          <div className="w-full rounded-[24px] border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-5">
            {/* Items List Rows */}
            <div className="flex flex-col gap-3">
              {summaryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none font-poppins text-sm"
                >
                  <span className="font-medium text-[#1A1A1A]">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">
                    Rs. {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Yellow Summary Banner Card */}
            <div className="w-full bg-[#FCBA08] rounded-[20px] p-6 text-[#2B1B0E] flex flex-col gap-3 shadow-sm mt-2">
              <div className="flex items-center justify-between font-poppins text-sm sm:text-base font-semibold">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between font-poppins text-xs sm:text-sm">
                <span>Standard delivery</span>
                <span className="font-medium">{deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="flex items-center justify-between font-poppins text-xs sm:text-sm">
                <span>Platform Fee</span>
                <span className="font-medium">Rs. {platformFee.toFixed(2)}</span>
              </div>

              {discount > 0 ? (
                <>
                  <div className="flex items-center justify-between font-poppins text-xs sm:text-sm font-extrabold pt-2 border-t border-[#2B1B0E]/20">
                    <span>Total before discount</span>
                    <span>Rs. {totalBeforeDiscount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between font-poppins text-xs sm:text-sm text-emerald-950 font-extrabold">
                    <span>Voucher Discount</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>

                  <div className="w-full border-t border-[#2B1B0E]/30 my-1" />

                  <div className="flex items-center justify-between font-poppins font-bold text-sm sm:text-base">
                    <span>Total <span className="text-xs text-[#2B1B0E]/70 font-normal">(incl. fees and tax)</span></span>
                    <span className="font-mali text-lg sm:text-xl text-[#381A05]">
                      Rs. {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full border-t border-[#2B1B0E]/30 my-1" />

                  <div className="flex items-center justify-between font-poppins font-bold text-sm sm:text-base">
                    <span>Total <span className="text-xs text-[#2B1B0E]/70 font-normal">(incl. fees and tax)</span></span>
                    <span className="font-mali text-lg sm:text-xl text-[#381A05]">
                      Rs. {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {placeOrderError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-poppins p-3.5 rounded-xl font-medium">
                ⚠️ {placeOrderError}
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full h-[52px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-base shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center cursor-pointer mt-2 focus:outline-none select-none"
            >
              {isSubmitting ? "Placing Order..." : "Place order"}
            </button>
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
