"use client";

import React from "react";
import { useFavorite } from "@/lib/useFavorite";

interface FavoriteButtonProps {
  entityType: "restaurant" | "shop" | "menu_item";
  entityId: string | number;
  className?: string;
  iconClassName?: string;
}

export default function FavoriteButton({
  entityType,
  entityId,
  className,
  iconClassName,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorite(entityType, entityId);

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={
        className ||
        "absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm"
      }
    >
      <svg
        className={
          iconClassName ||
          `w-5 h-5 transition-colors ${
            isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-600 stroke-[2]"
          }`
        }
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
