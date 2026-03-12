"use client";

import { useMapStore } from "@/lib/store";

export default function InfoPanel() {
  const feature = useMapStore((s) => s.selectedFeature);
  const layerId = useMapStore((s) => s.selectedLayerId);
  const selectFeature = useMapStore((s) => s.selectFeature);

  if (!feature) return null;

  const props = feature.properties || {};

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-slate-800">
          {props.name || props.ADM2_NAME || props.ADM3_NAME || "Feature Details"}
        </h3>
        <button
          onClick={() => selectFeature(null)}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          &times;
        </button>
      </div>
      {layerId && (
        <div className="text-xs text-slate-400 mb-2 uppercase">{layerId}</div>
      )}
      <div className="space-y-1">
        {Object.entries(props).map(([key, value]) => {
          if (value === null || value === undefined || value === "") return null;
          return (
            <div key={key} className="flex text-xs">
              <span className="text-slate-500 w-28 flex-shrink-0 truncate">
                {key}
              </span>
              <span className="text-slate-800 truncate">
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
