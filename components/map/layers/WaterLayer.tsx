"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import { useMapStore } from "@/lib/store";

export default function WaterLayer() {
  const visible = useMapStore((s) => s.layerVisibility.waterInfrastructure);
  const selectFeature = useMapStore((s) => s.selectFeature);
  const [data, setData] = useState<FeatureCollection<Point> | null>(null);

  useEffect(() => {
    if (visible && !data) {
      fetch("/data/infrastructure/water_infrastructure.geojson")
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
        const name = f.properties?.name || f.properties?.amenity || "Water Point";
        return (
          <CircleMarker
            key={`water-${i}`}
            center={[lat, lng]}
            radius={4}
            pathOptions={{
              color: "#0E7490",
              fillColor: "#06B6D4",
              fillOpacity: 0.8,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => selectFeature(f as Feature, "waterInfrastructure"),
            }}
          >
            <Tooltip>{name}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
