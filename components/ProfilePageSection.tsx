"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useUserProfile } from "@/lib/useUserData";

export default function ProfilePageSection() {
  const { data: userProfile, updateProfile } = useUserProfile();

  const [name, setName] = useState("Muhammad");
  const [email, setEmail] = useState("example@example.com");
  const [mobileNumber, setMobileNumber] = useState("+1 234567890");

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phone) setMobileNumber(userProfile.phone);
    }
  }, [userProfile]);

  const [editingField, setEditingField] = useState<"name" | "email" | "mobile" | null>(null);
  const [tempValue, setTempValue] = useState("");

  const handleStartEdit = (field: "name" | "email" | "mobile", currentVal: string) => {
    setEditingField(field);
    setTempValue(currentVal);
  };

  const handleSaveEdit = async (field: "name" | "email" | "mobile") => {
    if (field === "name") {
      setName(tempValue);
      await updateProfile.mutateAsync({ name: tempValue });
    } else if (field === "mobile") {
      setMobileNumber(tempValue);
      await updateProfile.mutateAsync({ phone: tempValue });
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* PROFILE HEADER TITLE */}
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-8 sm:mb-10 select-none">
          PROFILE
        </h1>

        {/* PROFILE FIELD CARDS CONTAINER */}
        <div className="flex flex-col gap-6 sm:gap-7">
          {/* CARD 1: NAME */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-poppins text-xs sm:text-sm text-gray-400 font-medium mb-1">
                Name
              </span>
              {editingField === "name" ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="font-poppins text-base font-bold text-[#1A1A1A] border-b-2 border-[#FCBA08] focus:outline-none py-1 max-w-[300px]"
                  autoFocus
                />
              ) : (
                <span className="font-poppins text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                  {name}
                </span>
              )}
            </div>

            {editingField === "name" ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleSaveEdit("name")}
                  className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-sm transition-all focus:outline-none"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-poppins font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit("name", name)}
                className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none select-none flex-shrink-0"
              >
                Edit
              </button>
            )}
          </div>

          {/* CARD 2: EMAIL */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-poppins text-xs sm:text-sm text-gray-400 font-medium mb-1">
                Email
              </span>
              {editingField === "email" ? (
                <input
                  type="email"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="font-poppins text-base font-bold text-[#1A1A1A] border-b-2 border-[#FCBA08] focus:outline-none py-1 max-w-[320px]"
                  autoFocus
                />
              ) : (
                <span className="font-poppins text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                  {email}
                </span>
              )}
            </div>

            {editingField === "email" ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleSaveEdit("email")}
                  className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-sm transition-all focus:outline-none"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-poppins font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit("email", email)}
                className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none select-none flex-shrink-0"
              >
                Edit
              </button>
            )}
          </div>

          {/* CARD 3: MOBILE NUMBER */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-poppins text-xs sm:text-sm text-gray-400 font-medium mb-1">
                Mobile Number
              </span>
              {editingField === "mobile" ? (
                <input
                  type="tel"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="font-poppins text-base font-bold text-[#1A1A1A] border-b-2 border-[#FCBA08] focus:outline-none py-1 max-w-[300px]"
                  autoFocus
                />
              ) : (
                <span className="font-poppins text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                  {mobileNumber}
                </span>
              )}
            </div>

            {editingField === "mobile" ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleSaveEdit("mobile")}
                  className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-sm transition-all focus:outline-none"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-poppins font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit("mobile", mobileNumber)}
                className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none select-none flex-shrink-0"
              >
                Edit
              </button>
            )}
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
