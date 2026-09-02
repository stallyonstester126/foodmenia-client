"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useCartStore } from "@/lib/cartStore";

interface NavbarProps {
  activeTab?: "home" | "restaurant" | "shop";
}

export default function Navbar({ activeTab = "home" }: NavbarProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart?.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (totalCartCount > 0) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalCartCount]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative z-50 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-[1196px] h-[78px] sm:h-[92px] lg:h-[106px] mx-auto px-6 sm:px-10 lg:px-12 bg-white/20 backdrop-blur-md rounded-b-[24px] sm:rounded-b-[28px] border-b border-x border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center justify-between relative">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none select-none flex-shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="foodmenia logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-poppins text-2xl sm:text-[27px] font-bold tracking-tight inline-flex items-center leading-none">
            <span className="text-white">food</span>
            <span className="text-[#2B1B0E]">menia</span>
          </span>
        </Link>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {user?.role === "restaurant_owner" ? (
            <Link
              href="/restaurant-dashboard"
              className="font-poppins text-[15px] sm:text-[16px] text-white font-bold transition-colors duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className={`font-poppins text-[15px] sm:text-[16px] transition-colors duration-200 ${
                  activeTab === "home"
                    ? "text-white font-semibold"
                    : "text-[#2B1B0E] font-medium hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                href="/restaurant"
                className={`font-poppins text-[15px] sm:text-[16px] transition-colors duration-200 ${
                  activeTab === "restaurant"
                    ? "text-white font-semibold"
                    : "text-[#2B1B0E] font-medium hover:text-white"
                }`}
              >
                Restaurant
              </Link>
              <Link
                href="/shop"
                className={`font-poppins text-[15px] sm:text-[16px] transition-colors duration-200 ${
                  activeTab === "shop"
                    ? "text-white font-semibold"
                    : "text-[#2B1B0E] font-medium hover:text-white"
                }`}
              >
                Shop
              </Link>
            </>
          )}
        </nav>

        {/* Right: User & Cart Icons */}
        <div className="flex items-center gap-4 sm:gap-5 relative">
          {/* User Profile Container & Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-label="User Account Menu"
              aria-expanded={profileMenuOpen}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 focus:outline-none ${
                profileMenuOpen
                  ? "bg-white/30 scale-105"
                  : "hover:bg-white/20 hover:scale-105 active:scale-95"
              }`}
            >
              <svg
                className="w-6 h-6 sm:w-[26px] sm:h-[26px] text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>

            {/* Profile Dropdown Card */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-[240px] sm:w-[260px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.18)] border border-gray-100 p-4 sm:p-5 flex flex-col gap-1 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 select-none">
                {!isAuthenticated ? (
                  <>
                    {/* 1. Login */}
                    <Link
                      href="/login"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#FCBA08] text-[#2B1B0E] font-poppins text-sm font-bold shadow-sm hover:bg-[#e5a807] transition-all"
                    >
                      <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                      </svg>
                      <span>Login / Sign Up</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-1" />

                    {/* 2. Help */}
                    <Link
                      href="/help"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.008v.008H12V18z" />
                      </svg>
                      <span>Help</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-0.5" />

                    {/* 3. Terms & Conditions */}
                    <Link
                      href="/terms"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>Terms &amp; Conditions</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {user?.role === "restaurant_owner" && (
                      <>
                        <Link
                          href="/restaurant-dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors group font-poppins text-sm font-semibold"
                        >
                          <svg className="w-5 h-5 text-amber-600 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75V10.5a.75.75 0 01.225-.53l8.25-8.25a.75.75 0 011.06 0l8.25 8.25a.75.75 0 01.225.53v9.75a.75.75 0 01-.75.75H13.5z" />
                          </svg>
                          <span>Owner Dashboard</span>
                        </Link>

                        <div className="w-full h-[1px] bg-gray-100 my-0.5" />
                      </>
                    )}

                    {/* 1. View Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>View Profile</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-0.5" />

                    {/* 2. My Orders */}
                    <Link
                      href="/orders"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0c-.565.058-.987.538-.987 1.106v.958m12 0A2.25 2.25 0 0117.25 9v1.5H3.75V9A2.25 2.25 0 016 6.75h10.5z" />
                      </svg>
                      <span>My Orders</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-0.5" />

                    {/* 3. Vouchers (Customer only) */}
                    {user?.role !== "restaurant_owner" && (
                      <>
                        <Link
                          href="/vouchers"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                        >
                          <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v1.372c0 .516-.351.966-.852 1.091l-1.148.287a1.125 1.125 0 000 2.185l1.148.287c.501.125.852.575.852 1.091v1.372A2.25 2.25 0 0118.75 18H3.75A2.25 2.25 0 011.5 15.75v-1.372c0-.516.351-.966.852-1.091l1.148-.287a1.125 1.125 0 000-2.185l-1.148-.287A1.125 1.125 0 011.5 9.622V8.25A2.25 2.25 0 013.75 6z" />
                          </svg>
                          <span>Vouchers</span>
                        </Link>

                        <div className="w-full h-[1px] bg-gray-100 my-0.5" />
                      </>
                    )}

                    {/* 4. Favorites (Customer only) */}
                    {user?.role !== "restaurant_owner" && (
                      <>
                        <Link
                          href="/favorites"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                        >
                          <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          <span>Favorites</span>
                        </Link>

                        <div className="w-full h-[1px] bg-gray-100 my-0.5" />
                      </>
                    )}

                    {/* 5. Settings */}
                    <Link
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-0.5" />

                    {/* 6. Help */}
                    <Link
                      href="/help"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.008v.008H12V18z" />
                      </svg>
                      <span>Help</span>
                    </Link>

                    <div className="w-full h-[1px] bg-gray-100 my-0.5" />

                    {/* 7. Terms & Conditions */}
                    <Link
                      href="/terms"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group font-poppins text-sm font-medium"
                    >
                      <svg className="w-5 h-5 text-gray-800 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>Terms &amp; Conditions</span>
                    </Link>

                    {/* 8. Logout Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        const { logout } = useAuthStore.getState();
                        await logout();
                        window.location.href = "/login";
                      }}
                      className="w-full h-[44px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm shadow-sm transition-all flex items-center justify-center cursor-pointer mt-2 focus:outline-none"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping Cart Button (Customers only) */}
          {user?.role !== "restaurant_owner" && (
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none relative ${
                cartBouncing ? "scale-125" : ""
              }`}
            >
              <svg
                className="w-6 h-6 sm:w-[26px] sm:h-[26px] text-white stroke-[1.75]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#FCBA08] text-[#2B1B0E] border-2 border-white text-[11px] font-extrabold font-poppins flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden w-9 h-9 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all duration-200 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-5 h-5 stroke-[2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 stroke-[2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 p-5 bg-[#FCBA08]/95 backdrop-blur-md rounded-2xl border border-[#2B1B0E]/15 shadow-xl flex flex-col gap-4 md:hidden z-40">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-poppins text-lg py-1 px-2 ${
                activeTab === "home"
                  ? "text-white font-bold"
                  : "text-[#2B1B0E] font-semibold"
              }`}
            >
              Home
            </Link>
            <Link
              href="/restaurant"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-poppins text-lg py-1 px-2 ${
                activeTab === "restaurant"
                  ? "text-white font-bold"
                  : "text-[#2B1B0E] font-semibold"
              }`}
            >
              Restaurant
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-poppins text-lg py-1 px-2 ${
                activeTab === "shop"
                  ? "text-white font-bold"
                  : "text-[#2B1B0E] font-semibold"
              }`}
            >
              Shop
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}
