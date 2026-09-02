"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useCartStore } from "@/lib/cartStore";

interface RegisterUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "customer" | "restaurant_owner" | "admin";
  email_verified?: boolean;
}

interface RegisterTokens {
  accessToken?: string;
  refreshToken?: string;
}

export default function RegisterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [accountType, setAccountType] = useState<"customer" | "restaurant_owner">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Verification States
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [registeredUser, setRegisteredUser] = useState<RegisterUser | null>(null);
  const [registeredTokens, setRegisteredTokens] = useState<RegisterTokens | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  const { setAuth } = useAuthStore();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpView && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpView, resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const displayName = name || email.split("@")[0];
      const res = await apiClient.post<{
        user?: RegisterUser;
        tokens?: RegisterTokens;
        data?: {
          user?: RegisterUser;
          tokens?: RegisterTokens;
          accessToken?: string;
          refreshToken?: string;
        };
      }>("/auth/register", {
        name: displayName,
        email,
        phone,
        password,
        accountType,
      });

      const user = res.user || res.data?.user || { id: `usr_${Date.now()}`, name: displayName, email, phone, role: accountType };
      const tokens = res.tokens || res.data?.tokens || {
        accessToken: res.data?.accessToken,
        refreshToken: res.data?.refreshToken,
      };

      setRegisteredUser(user);
      setRegisteredTokens(tokens);
      setShowOtpView(true);
      setResendCooldown(30);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Email may already be in use.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedText) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < pastedText.length; i++) {
      newOtp[i] = pastedText[i];
    }
    setOtpDigits(newOtp);
    if (pastedText.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedText.length]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setVerifying(true);
    setOtpError(null);

    try {
      await apiClient.post("/auth/verify-email", {
        email,
        otp: fullOtp,
      });

      // Verification successful -> log user in
      const role = registeredUser?.role || accountType;
      if (registeredTokens?.accessToken && registeredUser) {
        setAuth({ ...registeredUser, email_verified: true, role }, registeredTokens.accessToken, registeredTokens.refreshToken);
        await useCartStore.getState().syncGuestCart();
      }

      if (role === "restaurant_owner" && redirect === "/") {
        router.push("/restaurant-dashboard");
      } else {
        router.push(redirect);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired OTP code.";
      setOtpError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError(null);
    try {
      await apiClient.post("/auth/send-verification-otp", { email });
      setResendCooldown(45);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code.";
      setOtpError(message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* TOP CIRCULAR YELLOW BANNER WITH SLOTH BRANCH GRAPHIC */}
      <div className="w-full max-w-[480px] bg-[#FCBA08] rounded-b-[45%] h-[190px] sm:h-[220px] relative overflow-hidden flex items-center justify-center shadow-sm">
        <div className="relative w-[210px] h-[170px] sm:w-[240px] sm:h-[190px] top-2">
          <Image
            src="/menusticker.png"
            alt="Sloth on tree branch"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* FORM CONTENT AREA */}
      <main className="w-full max-w-[440px] px-6 sm:px-8 py-5 flex-1 flex flex-col justify-center relative z-10">
        {showOtpView ? (
          /* OTP VERIFICATION STEP */
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#FCBA08]/20 border border-[#FCBA08] flex items-center justify-center mb-3">
              <span className="text-2xl">📩</span>
            </div>
            <h1 className="font-mali text-2xl sm:text-3xl font-bold text-[#381A05] text-center mb-1">
              Verify your email
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 text-center mb-6 px-2">
              We sent a 6-digit OTP code to <strong className="text-[#2B1B0E]">{email}</strong>. Enter it below to activate your account.
            </p>

            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center gap-4">
              {otpError && (
                <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-poppins text-center">
                  {otpError}
                </div>
              )}

              {/* 6 Individual Digit Inputs */}
              <div className="flex items-center justify-between gap-2 w-full my-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl border border-gray-300 bg-white text-center font-mono font-bold text-xl sm:text-2xl text-[#2B1B0E] focus:border-[#FCBA08] focus:ring-2 focus:ring-[#FCBA08]/40 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Verify & Continue Button */}
              <button
                type="submit"
                disabled={verifying || otpDigits.join("").length !== 6}
                className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer mt-2 focus:outline-none"
              >
                {verifying ? "Verifying OTP..." : "Verify & Activate Account"}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-5 text-center">
              {resendCooldown > 0 ? (
                <p className="font-poppins text-xs text-gray-500">
                  Resend code in <strong className="text-[#2B1B0E] font-semibold">{resendCooldown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-poppins text-xs font-bold text-[#2B1B0E] hover:underline cursor-pointer"
                >
                  Didn&apos;t receive code? Resend OTP
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ACCOUNT CREATION FORM */
          <>
            <h1 className="font-mali text-2xl sm:text-3xl font-bold text-[#381A05] text-center mb-1">
              Create an account
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 text-center mb-4">
              Please enter your details to register
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-poppins">
                  {errorMsg}
                </div>
              )}

              {/* Account Type Selector */}
              <div className="flex flex-col gap-1 mb-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={`py-2 px-3 rounded-xl font-poppins text-xs font-semibold transition-all ${
                      accountType === "customer"
                        ? "bg-[#2B1B0E] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    🛍️ Order Food
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("restaurant_owner")}
                    className={`py-2 px-3 rounded-xl font-poppins text-xs transition-all ${
                      accountType === "restaurant_owner"
                        ? "bg-[#FCBA08] text-[#2B1B0E] font-bold shadow-sm"
                        : "text-gray-600 hover:text-gray-900 font-semibold"
                    }`}
                  >
                    🏪 Partner Restaurant
                  </button>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              {/* Phone Input */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 pr-11 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2B1B0E] focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.036 12c1.349-4.39 5.391-7.5 10.034-7.5s8.685 3.11 10.034 7.5c-1.349 4.39-5.391 7.5-10.034 7.5S3.385 16.39 2.036 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Confirm Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 pr-11 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2B1B0E] focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.036 12c1.349-4.39 5.391-7.5 10.034-7.5s8.685 3.11 10.034 7.5c-1.349 4.39-5.391 7.5-10.034 7.5S3.385 16.39 2.036 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-center gap-2 mt-1 select-none">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FCBA08] focus:ring-[#FCBA08]"
                />
                <label htmlFor="agreeTerms" className="font-poppins text-xs text-gray-600 cursor-pointer">
                  I agree to{" "}
                  <Link href="/terms" className="font-semibold text-[#1A1A1A] underline">
                    Terms &amp; Conditions
                  </Link>
                </label>
              </div>

              {/* Action Button: Create an account */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer mt-2 focus:outline-none"
              >
                {loading ? "Creating account..." : "Create an account"}
              </button>
            </form>

            {/* Footer Link: Login */}
            <p className="font-poppins text-xs text-gray-600 text-center mt-4">
              Have an account?{" "}
              <Link href="/login" className="font-bold text-[#1A1A1A] hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </main>

      {/* BOTTOM LEFT SLOTH STICKER DECORATION */}
      <div className="absolute left-2 bottom-2 w-20 h-20 pointer-events-none select-none opacity-80 z-0">
        <Image
          src="/sloth_sticker_1.png"
          alt=""
          width={80}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
