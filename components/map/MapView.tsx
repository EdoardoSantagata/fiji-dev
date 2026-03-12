"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
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

export default function MapView() {
  const baseTile = useMapStore((s) => s.baseTile);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const toggleSidebar = useMapStore((s) => s.toggleSidebar);

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r border-slate-200 flex flex-col z-10`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className="font-bold text-sm text-slate-800">
            Fiji Infrastructure
          </h1>
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-600 text-lg"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LayerControl />
          <InfoPanel />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded shadow text-sm hover:bg-slate-50"
          >
            Layers
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

          {/* Layers rendered in order (bottom to top) */}
          <BoundaryLayer />
          <PovertyLayer />
          <RoadsLayer />
          <WaterLayer />
          <EnergyLayer />
          <TelecomLayer />
          <FacilitiesLayer />
          <SettlementsLayer />
        </MapContainer>
        <Legend />
      </div>
    </div>
  );
}
