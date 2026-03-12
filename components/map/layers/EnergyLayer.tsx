"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { CircleMarker, GeoJSON, Tooltip } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useMapStore } from "@/lib/store";

export default function EnergyLayer() {
  const showSHS = useMapStore((s) => s.layerVisibility.shsCommunities);
  const showFREF = useMapStore((s) => s.layerVisibility.frefSites);
  const showGrid = useMapStore((s) => s.layerVisibility.gridLines);
  const showPower = useMapStore((s) => s.layerVisibility.powerPlants);
  const showSubs = useMapStore((s) => s.layerVisibility.substations);
  const selectFeature = useMapStore((s) => s.selectFeature);

  const [shs, setShs] = useState<FeatureCollection<Point> | null>(null);
  const [fref, setFref] = useState<FeatureCollection<Point> | null>(null);
  const [grid, setGrid] = useState<FeatureCollection | null>(null);
  const [power, setPower] = useState<FeatureCollection | null>(null);
  const [subs, setSubs] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (showSHS && !shs) {
      fetch("/data/energy/shs_communities.geojson")
        .then((r) => r.json())
        .then(setShs)
        .catch(console.error);
    }
  }, [showSHS, shs]);

  useEffect(() => {
    if (showFREF && !fref) {
      fetch("/data/energy/fref_sites.geojson")
        .then((r) => r.json())
        .then(setFref)
        .catch(console.error);
    }
  }, [showFREF, fref]);

  useEffect(() => {
    if (showGrid && !grid) {
      fetch("/data/energy/grid_lines.geojson")
        .then((r) => r.json())
        .then(setGrid)
        .catch(() => {}); // May not exist yet
    }
  }, [showGrid, grid]);

  useEffect(() => {
    if (showPower && !power) {
      fetch("/data/energy/power_plants.geojson")
        .then((r) => r.json())
        .then(setPower)
        .catch(() => {});
    }
  }, [showPower, power]);

  useEffect(() => {
    if (showSubs && !subs) {
      fetch("/data/energy/substations.geojson")
        .then((r) => r.json())
        .then(setSubs)
        .catch(() => {});
    }
  }, [showSubs, subs]);

  const gridStyle: PathOptions = {
    color: "#F59E0B",
    weight: 2,
    opacity: 0.8,
  };

  const getShsColor = (year?: string): string => {
    if (!year) return "#FBBF24";
    const y = parseInt(year);
    if (isNaN(y)) return "#FBBF24";
    if (y < 2005) return "#DC2626"; // Old — needs replacement
    if (y < 2010) return "#F97316"; // Aging
    return "#22C55E"; // Newer
  };

  return (
    <>
      {/* Grid lines */}
      {showGrid && grid && (
        <GeoJSON key="grid" data={grid} style={gridStyle} />
      )}

      {/* Power plants */}
      {showPower && power && (
        <GeoJSON
          key="power"
          data={power}
          pointToLayer={(feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#D97706",
              color: "#92400E",
              weight: 2,
              fillOpacity: 0.9,
            })
          }
          onEachFeature={(feature: GeoJSON.Feature, layer: Layer) => {
            (layer as L.Path).bindTooltip(
              feature.properties?.name || "Power Plant"
            );
            (layer as L.Path).on("click", () =>
              selectFeature(feature, "powerPlants")
            );
          }}
        />
      )}

      {/* Substations */}
      {showSubs && subs && (
        <GeoJSON
          key="substations"
          data={subs}
          pointToLayer={(feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#92400E",
              color: "#451A03",
              weight: 2,
              fillOpacity: 0.85,
            })
          }
          onEachFeature={(feature: GeoJSON.Feature, layer: Layer) => {
            (layer as L.Path).bindTooltip(
              feature.properties?.name || "Substation"
            );
            (layer as L.Path).on("click", () =>
              selectFeature(feature, "substations")
            );
          }}
        />
      )}

      {/* SHS communities */}
      {showSHS &&
        shs?.features.map((f, i) => {
          const [lng, lat] = f.geometry.coordinates;
          const name = f.properties?.name || "SHS Community";
          const year = f.properties?.year_installed;

          return (
            <CircleMarker
              key={`shs-${i}`}
              center={[lat, lng]}
              radius={6}
              pathOptions={{
                color: "#92400E",
                fillColor: getShsColor(year),
                fillOpacity: 0.8,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => selectFeature(f as Feature, "shsCommunities"),
              }}
            >
              <Tooltip>
                {name}
                {year ? ` (${year})` : ""}
              </Tooltip>
            </CircleMarker>
          );
        })}

      {/* FREF sites */}
      {showFREF &&
        fref?.features.map((f, i) => {
          const [lng, lat] = f.geometry.coordinates;
          const name = f.properties?.name || "FREF Site";

          return (
            <CircleMarker
              key={`fref-${i}`}
              center={[lat, lng]}
              radius={7}
              pathOptions={{
                color: "#C2410C",
                fillColor: "#F97316",
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => selectFeature(f as Feature, "frefSites"),
              }}
            >
              <Tooltip>{name}</Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}
