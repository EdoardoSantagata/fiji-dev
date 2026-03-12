"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Circle, Tooltip } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import { useMapStore } from "@/lib/store";

export default function TelecomLayer() {
  const visible = useMapStore((s) => s.layerVisibility.cellTowers);
  const selectFeature = useMapStore((s) => s.selectFeature);
  const [data, setData] = useState<FeatureCollection<Point> | null>(null);

  useEffect(() => {
    if (visible && !data) {
      fetch("/data/telecom/cell_towers.geojson")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }
  }, [visible, data]);

  if (!visible || !data) return null;

  return (
    <>
      {data.features.map((f, i) => {
        const [lng, lat] = f.geometry.coordinates;
        const radio = f.properties?.radio || "Unknown";

        // Approximate coverage radius by technology
        const coverageKm =
          radio === "LTE" ? 5 : radio === "UMTS" ? 8 : radio === "GSM" ? 15 : 5;

        return (
          <span key={`tower-${i}`}>
            <Circle
              center={[lat, lng]}
              radius={coverageKm * 1000}
              pathOptions={{
                color: "#10B981",
                fillColor: "#10B981",
                fillOpacity: 0.05,
                weight: 0.5,
              }}
            />
            <CircleMarker
              center={[lat, lng]}
              radius={4}
              pathOptions={{
                color: "#065F46",
                fillColor: "#10B981",
                fillOpacity: 0.9,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => selectFeature(f as Feature, "cellTowers"),
              }}
            >
              <Tooltip>
                Cell Tower ({radio})
              </Tooltip>
            </CircleMarker>
          </span>
        );
      })}
    </>
  );
}
