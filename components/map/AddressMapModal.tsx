"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LocationData } from "./AddressMapPicker";

// Dynamic SSR-safe import of Leaflet Map Component
const AddressMapPicker = dynamic(() => import("./AddressMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-2xl bg-gray-100 animate-pulse flex flex-col items-center justify-center text-gray-400 gap-2 font-poppins text-xs">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span>Loading OpenStreetMap...</span>
    </div>
  ),
});

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddress: (selectedAddress: string, locationData?: LocationData) => void;
  initialAddress?: string;
}

export default function AddressMapModal({
  isOpen,
  onClose,
  onConfirmAddress,
  initialAddress = "",
}: AddressMapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [customBuildingNote, setCustomBuildingNote] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalAddress = selectedLocation?.address || initialAddress;
    const combinedAddress = customBuildingNote.trim()
      ? `${customBuildingNote.trim()}, ${finalAddress}`
      : finalAddress;

    onConfirmAddress(combinedAddress, selectedLocation || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h3 className="font-mali text-xl font-bold text-[#2B1B0E]">
              Choose Delivery Address
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Map Picker */}
        <AddressMapPicker
          initialAddress={initialAddress}
          onLocationSelect={(data) => setSelectedLocation(data)}
        />

        {/* Building / Apartment Details */}
        <div className="flex flex-col gap-1 mt-1">
          <label className="font-poppins text-xs font-semibold text-gray-700">
            Building / Apartment / House No. <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={customBuildingNote}
            onChange={(e) => setCustomBuildingNote(e.target.value)}
            placeholder="e.g. Apt 4B, Block C, Maple Heights"
            className="w-full rounded-xl border border-gray-200 p-3 font-poppins text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-poppins font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 text-xs font-poppins font-bold bg-[#FCBA08] text-[#2B1B0E] hover:bg-[#e5a807] rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
