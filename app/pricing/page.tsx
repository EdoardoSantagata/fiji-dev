"use client";

import dynamic from "next/dynamic";

const PricingView = dynamic(() => import("@/components/pricing/PricingView"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
      <div className="text-slate-500">Loading pricing tool...</div>
    </div>
  ),
});

export default function PricingPage() {
  return <PricingView />;
}
