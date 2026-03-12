"use client";

import { useState } from "react";
import { MapContainer, TileLayer, ZoomControl, Polyline } from "react-leaflet";
import { useMapStore } from "@/lib/store";
import { FIJI_CENTER, FIJI_ZOOM, TILE_URLS, TILE_ATTRIBUTION } from "@/lib/constants";
import LayerControl from "./LayerControl";
import InfoPanel from "./InfoPanel";
import BoundaryLayer from "./layers/BoundaryLayer";
import SettlementsLayer from "./layers/SettlementsLayer";
import EnergyLayer from "./layers/EnergyLayer";
import FacilitiesLayer from "./layers/FacilitiesLayer";
import RoadsLayer from "./layers/RoadsLayer";
import TelecomLayer from "./layers/TelecomLayer";
import WaterLayer from "./layers/WaterLayer";
import PovertyLayer from "./layers/PovertyLayer";
import Legend from "./Legend";
import CostEstimator from "../pricing/CostEstimator";
import RouteDisplay from "../pricing/RouteDisplay";

export default function MapView() {
  const baseTile = useMapStore((s) => s.baseTile);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const toggleSidebar = useMapStore((s) => s.toggleSidebar);
  const routeResult = useMapStore((s) => s.routeResult);
  const selectedFeature = useMapStore((s) => s.selectedFeature);

  const [layersOpen, setLayersOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex">
      {/* Left sidebar — Logistics + Info */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r border-slate-200 flex flex-col z-10 flex-shrink-0`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className="font-bold text-sm text-slate-800">
            Fiji Infrastructure Planning
          </h1>
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            title="Close panel"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <CostEstimator />
          <RouteDisplay />
          {selectedFeature && <InfoPanel />}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Sidebar open button */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Planning Tool
          </button>
        )}

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
          <PovertyLayer />
          <RoadsLayer />
          <WaterLayer />
          <EnergyLayer />
          <TelecomLayer />
          <FacilitiesLayer />
          <SettlementsLayer />

          {/* Route polyline */}
          {routeResult?.geometry && (
            <Polyline
              positions={routeResult.geometry.coordinates.map(
                ([lng, lat]: number[]) => [lat, lng] as [number, number]
              )}
              pathOptions={{
                color: "#2563EB",
                weight: 4,
                opacity: 0.8,
                dashArray: "8 6",
              }}
            />
          )}
        </MapContainer>

        {/* Layer control — bottom right, collapsible */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          {layersOpen ? (
            <div className="bg-white rounded-lg shadow-lg w-56 max-h-[60vh] flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Layers
                </span>
                <button
                  onClick={() => setLayersOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="overflow-y-auto">
                <LayerControl />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setLayersOpen(true)}
              className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Layers
            </button>
          )}
        </div>

        {/* Legend — bottom left */}
        <Legend />
      </div>
    </div>
  );
}
