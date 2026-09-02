"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useCartStore } from "@/lib/cartStore";

export default function LoginSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post<{
        user?: { id?: string; name?: string; email?: string; role?: "customer" | "restaurant_owner" | "shop_owner" | "vendor" | "admin"; hasRestaurant?: boolean };
        tokens?: { accessToken?: string; refreshToken?: string };
        data?: {
          user?: { id?: string; name?: string; email?: string; role?: "customer" | "restaurant_owner" | "shop_owner" | "vendor" | "admin"; hasRestaurant?: boolean };
          tokens?: { accessToken?: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        };
        accessToken?: string;
        token?: string;
        refreshToken?: string;
      }>("/auth/login", { email, password });

      const user = res.user || res.data?.user;
      const accessToken =
        res.tokens?.accessToken ||
        res.accessToken ||
        res.token ||
        res.data?.tokens?.accessToken ||
        res.data?.accessToken;
      const refreshToken =
        res.tokens?.refreshToken ||
        res.refreshToken ||
        res.data?.tokens?.refreshToken ||
        res.data?.refreshToken;

      if (!accessToken || !user) {
        throw new Error("Authentication response missing user token.");
      }

      const role = (user.role as "customer" | "restaurant_owner" | "shop_owner" | "vendor" | "admin") || "customer";
      setAuth(
        {
          id: user.id || "usr_1",
          name: user.name || email.split("@")[0],
          email: user.email || email,
          role,
          hasRestaurant: user.hasRestaurant || false,
        },
        accessToken,
        refreshToken
      );

      await useCartStore.getState().syncGuestCart();

      const isVendorRole =
        role === "restaurant_owner" ||
        role === "shop_owner" ||
        role === "vendor";

      if (isVendorRole && (redirect === "/" || !redirect)) {
        router.push("/restaurant-dashboard");
      } else {
        router.push(redirect);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Header with Golden Background & Navbar */}
      <div className="relative w-full bg-[#FCBA08] pb-6 select-none">
        <Navbar activeTab="home" />
      </div>

      {/* Main Login Form Container */}
      <main className="w-full max-w-[440px] mx-auto px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center select-none z-10">
        <div className="text-center mb-6">
          <h1 className="font-mali uppercase text-[32px] font-bold text-[#2B1B0E]">
            WELCOME BACK!
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-gray-500 mt-1">
            Order your favorite meals in seconds
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-poppins font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-poppins text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#FCBA08] focus:ring-[#FCBA08]"
              />
              <span className="font-poppins text-xs text-gray-600">Remember me</span>
            </label>

            <Link href="/forgot-password" className="font-poppins text-xs font-semibold text-[#1A1A1A] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer mt-3 focus:outline-none"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="font-poppins text-xs text-gray-600 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[#1A1A1A] hover:underline">
            Sign Up
          </Link>
        </p>
      </main>

      <footer className="w-full bg-[#FCBA08] py-4 px-6 text-center select-none">
        <p className="font-poppins text-xs sm:text-sm text-[#2B1B0E] font-semibold tracking-normal">
          © 2026 Food Menia All rights reserved.
        </p>
      </footer>
    </div>
  );
}
