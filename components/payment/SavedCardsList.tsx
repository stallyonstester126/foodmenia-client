"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
}

interface SavedCardsListProps {
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
  refreshTrigger?: number;
}

export default function SavedCardsList({
  selectedCardId,
  onSelectCard,
  refreshTrigger = 0,
}: SavedCardsListProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSavedCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<SavedCard[] | { methods?: SavedCard[]; cards?: SavedCard[] }>("/payments/methods");
      const loadedCards: SavedCard[] = Array.isArray(data)
        ? data
        : data?.methods || data?.cards || [];

      setCards(loadedCards);

      // Auto-select first card if none selected
      if (loadedCards.length > 0 && !selectedCardId) {
        onSelectCard(loadedCards[0].id);
      }
    } catch (err: unknown) {
      console.warn("Backend API unavailable or error fetching cards:", err);
      setError("Unable to connect to backend server for saved cards.");
    } finally {
      setLoading(false);
    }
  }, [selectedCardId, onSelectCard]);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards, refreshTrigger]);

  const handleDeleteCard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this saved card?")) return;

    setDeletingId(id);
    try {
      await apiClient(`/payments/methods/${id}`, {
        method: "DELETE",
      });

      setCards((prev) => prev.filter((card) => card.id !== id));
      if (selectedCardId === id) {
        const remaining = cards.filter((card) => card.id !== id);
        onSelectCard(remaining.length > 0 ? remaining[0].id : "");
      }
    } catch (err) {
      console.error("Error deleting saved card:", err);
      alert("Failed to delete card. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderCardBrandIcon = (brand: string) => {
    const brandLower = (brand || "").toLowerCase();
    if (brandLower.includes("visa")) {
      return (
        <span className="font-poppins font-black italic text-blue-800 text-sm tracking-tighter">
          VISA
        </span>
      );
    }
    if (brandLower.includes("mastercard")) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90 -mr-1.5" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90" />
        </div>
      );
    }
    if (brandLower.includes("amex") || brandLower.includes("american express")) {
      return (
        <span className="font-poppins font-bold text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
          AMEX
        </span>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-3 py-2">
        <div className="w-full h-14 bg-gray-100 animate-pulse rounded-xl" />
        <div className="w-full h-14 bg-gray-100 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-poppins flex items-center justify-between">
        <span>{error}</span>
        <button
          type="button"
          onClick={fetchSavedCards}
          className="font-bold underline text-[#2B1B0E] hover:text-[#FCBA08]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-full py-4 text-center font-poppins text-xs text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100">
        No saved cards yet. Click &quot;+ Add new card&quot; below to add one.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {cards.map((card) => {
        const isSelected = selectedCardId === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onSelectCard(card.id)}
            className={`w-full rounded-[16px] border p-4 sm:p-5 flex items-center justify-between shadow-sm cursor-pointer transition-all ${
              isSelected
                ? "border-[#FCBA08] bg-amber-50/30 ring-2 ring-[#FCBA08]/30"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Radio Circle */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-[#FCBA08] bg-[#FCBA08]" : "border-gray-300"
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#2B1B0E]" />}
              </div>

              {/* Card Icon */}
              <div className="w-9 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                {renderCardBrandIcon(card.brand)}
              </div>

              {/* Card Details */}
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-sm text-[#1A1A1A]">
                  {card.brand ? card.brand.toUpperCase() : "CARD"} •••• {card.last4}
                </span>
              </div>
            </div>

            {/* Trash Delete Icon */}
            <button
              type="button"
              disabled={deletingId === card.id}
              onClick={(e) => handleDeleteCard(card.id, e)}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none disabled:opacity-50"
              title="Remove card"
            >
              {deletingId === card.id ? (
                <svg className="w-4 h-4 animate-spin text-red-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
