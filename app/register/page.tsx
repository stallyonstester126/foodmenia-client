import { Suspense } from "react";
import RegisterSection from "@/components/RegisterSection";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterSection />
    </Suspense>
  );
}
