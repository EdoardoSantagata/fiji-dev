"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import { useMapStore } from "@/lib/store";
import { SETTLEMENT_SIZES } from "@/lib/constants";

export default function SettlementsLayer() {
  const visible = useMapStore((s) => s.layerVisibility.settlements);
  const selectFeature = useMapStore((s) => s.selectFeature);
  const [data, setData] = useState<FeatureCollection<Point> | null>(null);

  useEffect(() => {
    if (visible && !data) {
      fetch("/data/settlements/settlements.geojson")
        .then((r) => r.json())
        .then(setData)
        .catch(console.error);
    }
  }, [visible, data]);

  if (!visible || !data) return null;

  return (
    <>
      {data.features.map((f, i) => {
        const [lng, lat] = f.geometry.coordinates;
        const name = f.properties?.name || "Unknown";
        const type = f.properties?.place_type || "village";
        const radius = SETTLEMENT_SIZES[type] || 3;

        return (
          <CircleMarker
            key={`settlement-${i}`}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color: "#7C3AED",
              fillColor: "#8B5CF6",
              fillOpacity: 0.7,
              weight: 1,
            }}
            eventHandlers={{
              click: () => selectFeature(f as Feature, "settlements"),
            }}
          >
            <Tooltip>{name}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
