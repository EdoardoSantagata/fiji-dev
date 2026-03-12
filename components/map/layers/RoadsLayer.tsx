"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { PathOptions } from "leaflet";
import { useMapStore } from "@/lib/store";
import { ROAD_COLORS } from "@/lib/constants";

export default function RoadsLayer() {
  const visible = useMapStore((s) => s.layerVisibility.roads);
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (visible && !data) {
      fetch("/data/infrastructure/roads.geojson")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {}); // May not exist yet
    }
  }, [visible, data]);

  if (!visible || !data) return null;

  const style = (feature?: GeoJSON.Feature): PathOptions => {
    const highway = feature?.properties?.highway || "default";
    const color = ROAD_COLORS[highway] || ROAD_COLORS.default;
    const weight =
      highway === "motorway" || highway === "trunk"
        ? 3
        : highway === "primary"
        ? 2.5
        : highway === "secondary"
        ? 2
        : highway === "track"
        ? 1
        : 1.5;

    return { color, weight, opacity: 0.7 };
  };

  return <GeoJSON key="roads" data={data} style={style} />;
}
