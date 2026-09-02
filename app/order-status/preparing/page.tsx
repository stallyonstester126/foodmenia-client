import { Suspense } from "react";
import OrderTrackingSection from "@/components/OrderTrackingSection";

export default function PreparingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OrderTrackingSection initialStatus="preparing" />
    </Suspense>
  );
}
