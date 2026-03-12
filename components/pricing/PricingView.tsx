"use client";

import { MapContainer, TileLayer, ZoomControl, Marker, Polyline, Tooltip } from "react-leaflet";
import { useMapStore } from "@/lib/store";
import { FIJI_CENTER, FIJI_ZOOM, TILE_URLS, TILE_ATTRIBUTION } from "@/lib/constants";
import CostEstimator from "./CostEstimator";
import RouteDisplay from "./RouteDisplay";
import SettlementsLayer from "../map/layers/SettlementsLayer";
import EnergyLayer from "../map/layers/EnergyLayer";
import BoundaryLayer from "../map/layers/BoundaryLayer";
import Link from "next/link";

export default function PricingView() {
  const baseTile = useMapStore((s) => s.baseTile);
  const routeResult = useMapStore((s) => s.routeResult);

  return (
    <div className="h-screen w-screen flex">
      {/* Left panel */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-10 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-sm text-slate-800">
              Logistics &amp; Pricing
            </h1>
            <Link
              href="/map"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Back to Map
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Select a community on the map, choose an intervention, and get a
            cost estimate with transport logistics.
          </p>
        </div>
        <CostEstimator />
        <RouteDisplay />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={FIJI_CENTER}
          zoom={FIJI_ZOOM}
          zoomControl={false}
          className="h-full w-full"
          worldCopyJump={true}
        >
          <ZoomControl position="topright" />
          <TileLayer url={TILE_URLS[baseTile]} attribution={TILE_ATTRIBUTION} />
          <BoundaryLayer />
          <EnergyLayer />
          <SettlementsLayer />

          {/* Route polyline */}
          {routeResult?.geometry && (
            <Polyline
              positions={routeResult.geometry.coordinates.map(([lng, lat]: number[]) => [
                lat,
                lng,
              ])}
              pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
