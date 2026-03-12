"use client";

import { useMapStore } from "@/lib/store";
import { LAYERS, LAYER_GROUPS, TILE_URLS } from "@/lib/constants";
import type { LayerGroup, LayerId } from "@/lib/types";

const groups = Object.keys(LAYER_GROUPS) as LayerGroup[];

export default function LayerControl() {
  const visibility = useMapStore((s) => s.layerVisibility);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const baseTile = useMapStore((s) => s.baseTile);
  const setBaseTile = useMapStore((s) => s.setBaseTile);

  return (
    <div className="p-4 space-y-4">
      {/* Base map selector */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Base Map
        </div>
        <select
          value={baseTile}
          onChange={(e) => setBaseTile(e.target.value as keyof typeof TILE_URLS)}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
        >
          <option value="cartodb_light">CartoDB Light</option>
          <option value="osm">OpenStreetMap</option>
          <option value="cartodb_dark">CartoDB Dark</option>
        </select>
      </div>

      {/* Layer groups */}
      {groups.map((group) => {
        const groupLayers = LAYERS.filter((l) => l.group === group);
        if (groupLayers.length === 0) return null;
        const groupMeta = LAYER_GROUPS[group];

        return (
          <div key={group}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: groupMeta.color }}
              />
              {groupMeta.label}
            </div>
            <div className="space-y-1">
              {groupLayers.map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={!!visibility[layer.id]}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded border-slate-300"
                  />
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  {layer.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
