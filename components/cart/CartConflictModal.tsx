"use client";

import { useCartStore } from "@/lib/cartStore";

export default function CartConflictModal() {
  const { conflictModal, closeConflictModal, addToCart } = useCartStore();

  if (!conflictModal || !conflictModal.isOpen) return null;

  const handleConfirm = async () => {
    if (conflictModal.pendingItem) {
      await addToCart({ ...conflictModal.pendingItem, confirmClear: true });
    }
    closeConflictModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-[24px] max-w-[440px] w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h3 className="font-mali text-xl sm:text-2xl font-bold text-[#2B1B0E] mb-2">
          Create new order?
        </h3>

        <p className="font-poppins text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
          Your cart currently contains items from <strong className="text-[#1A1A1A]">{conflictModal.currentRestaurantName}</strong>. Adding items from another restaurant will clear your existing cart.
        </p>

        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={closeConflictModal}
            className="flex-1 h-[46px] rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-poppins font-semibold text-xs sm:text-sm transition-all focus:outline-none"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-[46px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm shadow-sm transition-all focus:outline-none"
          >
            Clear &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
