"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import { useMapStore } from "@/lib/store";

export default function FacilitiesLayer() {
  const showSchools = useMapStore((s) => s.layerVisibility.schools);
  const showHealth = useMapStore((s) => s.layerVisibility.healthFacilities);
  const selectFeature = useMapStore((s) => s.selectFeature);

  const [schools, setSchools] = useState<FeatureCollection<Point> | null>(null);
  const [health, setHealth] = useState<FeatureCollection<Point> | null>(null);

  useEffect(() => {
    if (showSchools && !schools) {
      fetch("/data/infrastructure/schools.geojson")
        .then((r) => r.json())
        .then(setSchools)
        .catch(() => {});
    }
  }, [showSchools, schools]);

  useEffect(() => {
    if (showHealth && !health) {
      fetch("/data/infrastructure/health_facilities.geojson")
        .then((r) => r.json())
        .then(setHealth)
        .catch(() => {});
    }
  }, [showHealth, health]);

  return (
    <>
      {showSchools &&
        schools?.features.map((f, i) => {
          const [lng, lat] = f.geometry.coordinates;
          const name = f.properties?.name || "School";
          return (
            <CircleMarker
              key={`school-${i}`}
              center={[lat, lng]}
              radius={5}
              pathOptions={{
                color: "#1D4ED8",
                fillColor: "#3B82F6",
                fillOpacity: 0.8,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => selectFeature(f as Feature, "schools"),
              }}
            >
              <Tooltip>{name}</Tooltip>
            </CircleMarker>
          );
        })}

      {showHealth &&
        health?.features.map((f, i) => {
          const [lng, lat] = f.geometry.coordinates;
          const name = f.properties?.name || "Health Facility";
          return (
            <CircleMarker
              key={`health-${i}`}
              center={[lat, lng]}
              radius={5}
              pathOptions={{
                color: "#B91C1C",
                fillColor: "#EF4444",
                fillOpacity: 0.8,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => selectFeature(f as Feature, "healthFacilities"),
              }}
            >
              <Tooltip>{name}</Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}
