"use client";

import React, { useEffect } from "react";
import { useDialogStore } from "@/lib/dialogStore";

export default function CustomDialog() {
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    handleConfirm,
    handleCancel,
  } = useDialogStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (type === "confirm") {
          handleCancel();
        } else {
          handleConfirm();
        }
      } else if (e.key === "Enter") {
        handleConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, type, handleConfirm, handleCancel]);

  if (!isOpen) return null;

  // Variant aesthetics
  const getIconAndColors = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-emerald-100 text-emerald-600",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ),
          confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
        };
      case "error":
      case "danger":
        return {
          iconBg: "bg-rose-100 text-rose-600",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
        };
      case "warning":
        return {
          iconBg: "bg-amber-100 text-amber-600",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ),
          confirmBtn: "bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] shadow-[#FCBA08]/30",
        };
      case "info":
      default:
        return {
          iconBg: "bg-amber-100 text-amber-700",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          confirmBtn: "bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] shadow-[#FCBA08]/30",
        };
    }
  };

  const { iconBg, icon, confirmBtn } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={type === "confirm" ? handleCancel : handleConfirm}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-[28px] max-w-[420px] w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-10">
        {/* Status Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg} shadow-inner`}>
          {icon}
        </div>

        {/* Title */}
        {title && (
          <h3 className="font-mali text-xl sm:text-2xl font-bold text-[#2B1B0E] mb-2 leading-snug">
            {title}
          </h3>
        )}

        {/* Message */}
        <p className="font-poppins text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line max-h-[60vh] overflow-y-auto">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-3">
          {type === "confirm" && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-[48px] rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-poppins font-semibold text-xs sm:text-sm transition-all focus:outline-none cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 h-[48px] rounded-xl font-poppins font-bold text-xs sm:text-sm shadow-md transition-all focus:outline-none cursor-pointer ${confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
