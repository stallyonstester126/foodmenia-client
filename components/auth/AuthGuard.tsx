"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useCartStore } from "@/lib/cartStore";
import CartToast from "@/components/cart/CartToast";
import CartConflictModal from "@/components/cart/CartConflictModal";

const PROTECTED_ROUTES = [
  "/checkout",
  "/profile",
  "/orders",
  "/settings",
  "/favorites",
  "/order-status",
];

const GUEST_ONLY_ROUTES = ["/login", "/register", "/auth"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    initializeAuth();
    fetchCart();
  }, [initializeAuth, fetchCart]);

  useEffect(() => {
    if (isLoading) return;

    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isGuestOnly = GUEST_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtected && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isGuestOnly && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <>
      {children}
      <CartToast />
      <CartConflictModal />
    </>
  );
}
