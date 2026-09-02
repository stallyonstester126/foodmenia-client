"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  purpose: "restaurant-cover" | "menu-item" | "avatar";
  aspectRatio?: string;
  label?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUpload({
  value,
  onChange,
  purpose,
  aspectRatio = "aspect-[16/9]",
  label = "Upload Image",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // 1. File Type Validation
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError("Unsupported file format. Please upload JPG, PNG, or WEBP images only.");
      return false;
    }

    // 2. File Size Validation (Max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum file size allowed is 5MB.");
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("purpose", purpose);

      const response = await apiClient.uploadForm<unknown>(
        "/uploads/image",
        formData
      );

      const resObj = (response || {}) as Record<string, unknown>;
      const nestedObj = (resObj?.data || resObj) as Record<string, unknown>;
      const url = String(nestedObj?.url || resObj?.url || "");
      const pid = String(nestedObj?.publicId || resObj?.publicId || "");

      if (url && url !== "undefined") {
        setPublicId(pid || null);
        onChange(url);
      } else {
        setError("Upload failed. No image URL returned from server.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);

    if (publicId) {
      try {
        await apiClient.delete("/uploads/image", {
          body: JSON.stringify({ publicId }),
        });
      } catch {
        // Best-effort cleanup
      } finally {
        setPublicId(null);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {label && (
        <label className="font-poppins font-semibold text-xs sm:text-sm text-gray-700 min-h-[42px] flex flex-col justify-end">
          {typeof label === "string" && label.includes("(") ? (
            <>
              <span className="leading-tight text-gray-800 font-bold">{label.split("(")[0].trim()}</span>
              <span className="text-[11px] font-medium text-gray-400 leading-tight">({label.split("(")[1]}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </label>
      )}

      {/* DRAG AND DROP ZONE / PREVIEW */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 bg-gray-50/70 group ${
          isDragging
            ? "border-[#FCBA08] bg-[#FCBA08]/10 scale-[1.01]"
            : value
            ? "border-gray-200 hover:border-[#FCBA08]"
            : "border-gray-300 hover:border-[#FCBA08] hover:bg-amber-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* LOADING SPINNER OVERLAY */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center gap-2 text-white backdrop-blur-xs">
            <svg
              className="animate-spin h-8 w-8 text-[#FCBA08]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-poppins text-xs font-semibold">Uploading image...</span>
          </div>
        )}

        {/* PREVIEW CONTAINER */}
        {value ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              className="object-cover rounded-xl"
              unoptimized={value.startsWith("data:")}
            />

            {/* HOVER OVERLAY & REMOVE BUTTON */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="bg-white/90 text-gray-800 text-xs font-poppins font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                Change Image
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-transform hover:scale-105 active:scale-95"
                title="Remove image"
              >
                <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY DRAG AND DROP PROMPT */
          <div className="flex flex-col items-center justify-center text-center gap-2 p-2">
            <div className="w-12 h-12 rounded-full bg-amber-100/80 text-[#2B1B0E] flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
              📷
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-bold text-xs sm:text-sm text-[#2B1B0E]">
                Drag and drop image here, or <span className="text-[#e5a807] underline">browse</span>
              </span>
              <span className="font-poppins text-[11px] text-gray-400 mt-0.5">
                PNG, JPG, or WEBP (Max 5MB)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-poppins text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
