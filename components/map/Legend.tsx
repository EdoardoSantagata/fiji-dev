"use client";

import { useMapStore } from "@/lib/store";
import { LAYERS, ROAD_COLORS, POVERTY_BREAKS, SETTLEMENT_SIZES } from "@/lib/constants";

export default function Legend() {
  const visibility = useMapStore((s) => s.layerVisibility);

  const activeLayers = LAYERS.filter((l) => visibility[l.id]);
  if (activeLayers.length === 0) return null;

  const showPoverty = visibility.poverty;
  const showRoads = visibility.roads;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-52 text-xs">
      <div className="font-semibold text-slate-700 mb-2">Legend</div>

      {/* Active point/polygon layers */}
      <div className="space-y-1">
        {activeLayers
          .filter((l) => l.id !== "poverty" && l.id !== "roads")
          .map((l) => (
            <div key={l.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-slate-600">{l.label}</span>
            </div>
          ))}
      </div>

      {/* Road legend */}
      {showRoads && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="font-medium text-slate-600 mb-1">Roads</div>
          {Object.entries(ROAD_COLORS)
            .filter(([k]) => k !== "default")
            .slice(0, 5)
            .map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-4 h-0.5 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-500 capitalize">{type}</span>
              </div>
            ))}
        </div>
      )}

      {/* Poverty legend */}
      {showPoverty && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="font-medium text-slate-600 mb-1">
            Poverty Headcount
          </div>
          {POVERTY_BREAKS.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 flex-shrink-0"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
