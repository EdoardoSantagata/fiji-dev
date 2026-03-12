"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useMapStore } from "@/lib/store";
import { POVERTY_BREAKS } from "@/lib/constants";

export default function PovertyLayer() {
  const visible = useMapStore((s) => s.layerVisibility.poverty);
  const selectFeature = useMapStore((s) => s.selectFeature);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (visible && !data) {
      fetch("/data/demographics/poverty_tikina.geojson")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {}); // May not exist yet
    }
  }, [visible, data]);

  if (!visible || !data) return null;

  const getColor = (rate: number): string => {
    for (const b of POVERTY_BREAKS) {
      if (rate >= b.min && rate < b.max) return b.color;
    }
    return POVERTY_BREAKS[POVERTY_BREAKS.length - 1].color;
  };

  const style = (feature?: GeoJSON.Feature): PathOptions => {
    const rate = feature?.properties?.poverty_rate || 0;
    return {
      fillColor: getColor(rate),
      fillOpacity: 0.6,
      color: "#fff",
      weight: 1,
      opacity: 0.8,
    };
  };

  const onEach = (feature: GeoJSON.Feature, layer: Layer) => {
    const name = feature.properties?.ADM3_NAME || "Unknown";
    const rate = feature.properties?.poverty_rate;
    (layer as L.Path).bindTooltip(
      `${name}: ${rate != null ? rate.toFixed(1) + "%" : "N/A"}`
    );
    (layer as L.Path).on("click", () => selectFeature(feature, "poverty"));
  };

  return <GeoJSON key="poverty" data={data} style={style} onEachFeature={onEach} />;
}
