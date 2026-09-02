"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/lib/authStore";

export default function SettingsPageSection() {
  const [language] = useState("English");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offersEmail, setOffersEmail] = useState(true);
  const [showFloatingIcon, setShowFloatingIcon] = useState(true);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Header with Golden Background (#FCBA08) & Navbar */}
      <div className="w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[1196px] mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex-1">
        {/* SETTINGS HEADER TITLE */}
        <h1 className="font-mali uppercase text-[32px] sm:text-[38px] font-bold text-[#2B1B0E] mb-8 select-none">
          SETTINGS
        </h1>

        {/* SETTINGS CARDS LIST */}
        <div className="flex flex-col gap-6 sm:gap-7">
          {/* CARD 1: LANGUAGE */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="flex flex-col">
              <span className="font-poppins text-xs sm:text-sm text-gray-400 font-medium mb-1">
                Language
              </span>
              <span className="font-poppins text-base sm:text-lg font-bold text-[#1A1A1A]">
                {language}
              </span>
            </div>

            <Link
              href="/help"
              className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none select-none flex items-center justify-center"
            >
              Help
            </Link>
          </div>

          {/* CARD 2: RECEIVE PUSH NOTIFICATIONS */}
          <div
            onClick={() => setPushNotifications(!pushNotifications)}
            className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center gap-4 cursor-pointer select-none transition-all hover:border-gray-300"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-white transition-colors ${
                pushNotifications ? "bg-[#381A05]" : "border-2 border-gray-300 bg-white"
              }`}
            >
              {pushNotifications && (
                <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>

            <span className="font-poppins text-sm sm:text-base font-medium text-[#1A1A1A]">
              Receive push notifications
            </span>
          </div>

          {/* CARD 3: RECEIVE OFFERS BY EMAIL */}
          <div
            onClick={() => setOffersEmail(!offersEmail)}
            className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center gap-4 cursor-pointer select-none transition-all hover:border-gray-300"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-white transition-colors ${
                offersEmail ? "bg-[#381A05]" : "border-2 border-gray-300 bg-white"
              }`}
            >
              {offersEmail && (
                <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>

            <span className="font-poppins text-sm sm:text-base font-medium text-[#1A1A1A]">
              Receive offers by email
            </span>
          </div>

          {/* CARD 4: SHOW FLOATING ICON */}
          <div
            onClick={() => setShowFloatingIcon(!showFloatingIcon)}
            className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex items-center gap-4 cursor-pointer select-none transition-all hover:border-gray-300"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-white transition-colors ${
                showFloatingIcon ? "bg-[#381A05]" : "border-2 border-gray-300 bg-white"
              }`}
            >
              {showFloatingIcon && (
                <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>

            <span className="font-poppins text-sm sm:text-base font-medium text-[#1A1A1A]">
              Show floating icon
            </span>
          </div>

          {/* CARD 5: CHANGE PASSWORD */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col gap-4 transition-all">
            <span className="font-poppins text-xs sm:text-sm text-gray-400 font-medium">
              Change Password
            </span>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;

                try {
                  const { apiClient } = await import("@/lib/apiClient");
                  await apiClient.post("/auth/change-password", { currentPassword, newPassword });
                  alert("Password changed successfully!");
                  form.reset();
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : "Failed to change password.";
                  alert(message);
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full"
            >
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                required
                className="flex-1 w-full rounded-xl border border-gray-200 p-2.5 font-poppins text-xs focus:outline-none focus:ring-2 focus:ring-[#FCBA08]"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                required
                className="flex-1 w-full rounded-xl border border-gray-200 p-2.5 font-poppins text-xs focus:outline-none focus:ring-2 focus:ring-[#FCBA08]"
              />
              <button
                type="submit"
                className="bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all focus:outline-none select-none flex-shrink-0"
              >
                Update
              </button>
            </form>
          </div>

          {/* CARD 6: SIGN OUT OF ALL DEVICES */}
          <div className="w-full rounded-[20px] sm:rounded-[24px] border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="flex flex-col">
              <span className="font-poppins text-xs sm:text-sm text-red-600 font-semibold mb-0.5">
                Security &amp; Sessions
              </span>
              <span className="font-poppins text-sm sm:text-base font-medium text-[#1A1A1A]">
                Sign out of all active devices
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (confirm("Are you sure you want to log out from all devices?")) {
                  const { logoutAll } = useAuthStore.getState();
                  await logoutAll();
                  window.location.href = "/login";
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-poppins font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all focus:outline-none select-none"
            >
              Log Out All
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
