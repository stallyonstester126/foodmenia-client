import { Suspense } from "react";
import LoginSection from "@/components/LoginSection";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginSection />
    </Suspense>
  );
}
