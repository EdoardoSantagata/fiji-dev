"use client";

import dynamic from "next/dynamic";

// React-Leaflet must be loaded client-side only (no SSR)
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
      <div className="text-slate-500">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  return <MapView />;
}
