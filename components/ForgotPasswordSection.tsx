"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

export default function ForgotPasswordSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset OTP & Password State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setStep("verify");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset code. Please check your email.";
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit reset code.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.post("/auth/reset-password", {
        email,
        otp: fullOtp,
        newPassword,
      });

      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired reset code.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* TOP CIRCULAR YELLOW BANNER WITH SLOTH BRANCH GRAPHIC */}
      <div className="w-full max-w-[480px] bg-[#FCBA08] rounded-b-[45%] h-[210px] sm:h-[240px] relative overflow-hidden flex items-center justify-center shadow-sm">
        <div className="relative w-[230px] h-[190px] sm:w-[260px] sm:h-[210px] top-2">
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
      <main className="w-full max-w-[440px] px-6 sm:px-8 py-6 flex-1 flex flex-col justify-center relative z-10">
        {step === "request" && (
          <>
            <h1 className="font-mali text-2xl sm:text-3xl font-bold text-[#381A05] text-center mb-1">
              Reset Password
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 text-center mb-6">
              Enter your email to receive a 6-digit password reset OTP code
            </p>

            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-poppins">
                  {errorMsg}
                </div>
              )}

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
                  className="w-full rounded-xl border border-gray-200 bg-white p-3.5 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer mt-2 focus:outline-none"
              >
                {loading ? "Sending OTP..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {step === "verify" && (
          <>
            <h1 className="font-mali text-2xl sm:text-3xl font-bold text-[#381A05] text-center mb-1">
              Enter Reset Code
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-gray-500 text-center mb-5">
              Enter the 6-digit code sent to <strong className="text-[#2B1B0E]">{email}</strong> and your new password
            </p>

            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-poppins text-center">
                  {errorMsg}
                </div>
              )}

              {/* 6 Digit OTP Input */}
              <div className="flex items-center justify-between gap-2 w-full my-1">
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

              {/* New Password */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  New Password
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 pr-11 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
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

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-xs font-semibold text-[#1A1A1A]">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 font-poppins text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FCBA08]/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] disabled:opacity-50 text-[#2B1B0E] font-poppins font-bold text-sm sm:text-base shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer mt-2 focus:outline-none"
              >
                {loading ? "Resetting..." : "Reset Password & Login"}
              </button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
            <h2 className="font-mali text-2xl font-bold text-[#381A05]">
              Password Reset Successful!
            </h2>
            <p className="font-poppins text-xs text-gray-600">
              Your password has been reset. You may now log in with your new password.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-2 w-full h-[48px] rounded-xl bg-[#FCBA08] hover:bg-[#e5a807] text-[#2B1B0E] font-poppins font-bold text-sm shadow-md flex items-center justify-center cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Footer Link: Login */}
        {step !== "success" && (
          <p className="font-poppins text-xs text-gray-600 text-center mt-6">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-[#1A1A1A] hover:underline">
              Sign In
            </Link>
          </p>
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
