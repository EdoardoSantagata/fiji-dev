"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useMapStore } from "@/lib/store";

export default function BoundaryLayer() {
  const showProvinces = useMapStore((s) => s.layerVisibility.provinces);
  const showTikinas = useMapStore((s) => s.layerVisibility.tikinas);
  const selectFeature = useMapStore((s) => s.selectFeature);

  const [provinces, setProvinces] = useState<FeatureCollection | null>(null);
  const [tikinas, setTikinas] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (showProvinces && !provinces) {
      fetch("/data/boundaries/provinces.geojson")
        .then((r) => r.json())
        .then(setProvinces)
        .catch(console.error);
    }
  }, [showProvinces, provinces]);

  useEffect(() => {
    if (showTikinas && !tikinas) {
      fetch("/data/boundaries/tikinas.geojson")
        .then((r) => r.json())
        .then(setTikinas)
        .catch(console.error);
    }
  }, [showTikinas, tikinas]);

  const provinceStyle: PathOptions = {
    color: "#6B7280",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.05,
  };

  const tikinaStyle: PathOptions = {
    color: "#9CA3AF",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.02,
    dashArray: "4 4",
  };

  const onEachProvince = (feature: GeoJSON.Feature, layer: Layer) => {
    const name = feature.properties?.ADM2_EN || "Unknown";
    (layer as L.Path).bindTooltip(name, { sticky: true });
    (layer as L.Path).on("click", () => selectFeature(feature, "provinces"));
  };

  const onEachTikina = (feature: GeoJSON.Feature, layer: Layer) => {
    const name = feature.properties?.ADM3_EN || "Unknown";
    (layer as L.Path).bindTooltip(name, { sticky: true });
    (layer as L.Path).on("click", () => selectFeature(feature, "tikinas"));
  };

  return (
    <>
      {showTikinas && tikinas && (
        <GeoJSON
          key="tikinas"
          data={tikinas}
          style={tikinaStyle}
          onEachFeature={onEachTikina}
        />
      )}
      {showProvinces && provinces && (
        <GeoJSON
          key="provinces"
          data={provinces}
          style={provinceStyle}
          onEachFeature={onEachProvince}
        />
      )}
    </>
  );
}
