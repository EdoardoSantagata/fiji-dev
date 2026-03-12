"use client";

import { useState } from "react";
import { useMapStore } from "@/lib/store";

// Common depot/port locations in Fiji
const DEPOTS = [
  { name: "Suva (Kings Wharf)", coords: [-18.1416, 178.4419] as [number, number] },
  { name: "Lautoka Port", coords: [-17.6065, 177.4517] as [number, number] },
  { name: "Labasa", coords: [-16.4267, 179.3639] as [number, number] },
  { name: "Savusavu", coords: [-16.7744, 179.3419] as [number, number] },
  { name: "Nausori", coords: [-18.0333, 178.5333] as [number, number] },
];

export default function RouteDisplay() {
  const selectedFeature = useMapStore((s) => s.selectedFeature);
  const routeResult = useMapStore((s) => s.routeResult);
  const setRouteResult = useMapStore((s) => s.setRouteResult);
  const setRouteOrigin = useMapStore((s) => s.setRouteOrigin);
  const setRouteDestination = useMapStore((s) => s.setRouteDestination);

  const [selectedDepot, setSelectedDepot] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = selectedFeature?.geometry
    ? (selectedFeature.geometry as GeoJSON.Point).coordinates
    : null;

  const calculateRoute = async () => {
    if (!destination) return;

    const origin = DEPOTS[selectedDepot].coords;
    setRouteOrigin(origin);
    setRouteDestination([destination[1], destination[0]]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: origin[0], lng: origin[1] },
          destination: { lat: destination[1], lng: destination[0] },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Route calculation failed");
        // Fallback: straight-line distance
        const R = 6371;
        const dLat = ((destination[1] - origin[0]) * Math.PI) / 180;
        const dLon = ((destination[0] - origin[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((origin[0] * Math.PI) / 180) *
            Math.cos((destination[1] * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightLine = R * c;

        setRouteResult({
          distanceKm: straightLine * 1.4, // Road factor
          durationMinutes: (straightLine * 1.4) / 40 * 60, // Assume 40 km/h
          geometry: {
            type: "LineString",
            coordinates: [
              [origin[1], origin[0]],
              [destination[0], destination[1]],
            ],
          },
        });
      } else {
        const data = await res.json();
        setRouteResult(data);
      }
    } catch {
      setError("Could not reach routing service — using straight-line estimate");
      // Same fallback
      const R = 6371;
      const origin = DEPOTS[selectedDepot].coords;
      const dLat = ((destination[1] - origin[0]) * Math.PI) / 180;
      const dLon = ((destination[0] - origin[1]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((origin[0] * Math.PI) / 180) *
          Math.cos((destination[1] * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightLine = R * c;

      setRouteResult({
        distanceKm: straightLine * 1.4,
        durationMinutes: (straightLine * 1.4) / 40 * 60,
        geometry: {
          type: "LineString",
          coordinates: [
            [origin[1], origin[0]],
            [destination[0], destination[1]],
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t border-slate-200 space-y-3">
      <div className="text-xs font-semibold text-slate-500 uppercase">
        Route Calculator
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Origin (Depot/Port)
        </label>
        <select
          value={selectedDepot}
          onChange={(e) => setSelectedDepot(parseInt(e.target.value))}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
        >
          {DEPOTS.map((d, i) => (
            <option key={i} value={i}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Destination
        </label>
        <div className="text-sm text-slate-700">
          {selectedFeature?.properties?.name || (
            <span className="text-slate-400">Select on map</span>
          )}
        </div>
      </div>

      <button
        onClick={calculateRoute}
        disabled={!destination || loading}
        className="w-full bg-slate-800 text-white text-sm font-medium py-2 rounded hover:bg-slate-900 transition-colors disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Calculate Route"}
      </button>

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {error}
        </div>
      )}

      {routeResult && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Distance</span>
            <span className="font-medium">
              {routeResult.distanceKm.toFixed(1)} km
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Est. Travel Time</span>
            <span className="font-medium">
              {Math.round(routeResult.durationMinutes)} min (
              {(routeResult.durationMinutes / 60).toFixed(1)} hrs)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
