import { Suspense } from "react";
import OrderTrackingSection from "@/components/OrderTrackingSection";

export default function DeliveryStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OrderTrackingSection initialStatus="dispatched" />
    </Suspense>
  );
}
