"use client";

import { useState } from "react";
import { useMapStore } from "@/lib/store";
import { PRICING } from "@/lib/constants";
import type { InterventionType, CostEstimate } from "@/lib/types";

const interventions = Object.keys(PRICING) as InterventionType[];

export default function CostEstimator() {
  const selectedFeature = useMapStore((s) => s.selectedFeature);
  const selectedIntervention = useMapStore((s) => s.selectedIntervention);
  const setIntervention = useMapStore((s) => s.setIntervention);
  const costEstimate = useMapStore((s) => s.costEstimate);
  const setCostEstimate = useMapStore((s) => s.setCostEstimate);
  const routeResult = useMapStore((s) => s.routeResult);

  const [households, setHouseholds] = useState(50);
  const [distanceOverride, setDistanceOverride] = useState<string>("");

  const community = selectedFeature?.properties?.name || "";
  const pricing = PRICING[selectedIntervention];

  const calculate = () => {
    const distanceKm = distanceOverride
      ? parseFloat(distanceOverride)
      : routeResult?.distanceKm || 100;

    let equipmentCost: number;
    let installationCost: number;
    let transportCost: number;

    if (selectedIntervention === "grid_extension") {
      // Per-km cost for grid extension
      equipmentCost = pricing.unitCost * distanceKm;
      installationCost = 0;
      transportCost = 0;
    } else {
      equipmentCost = pricing.unitCost * households;
      installationCost = pricing.installationPerUnit * households;
      transportCost = pricing.transportPerKm * distanceKm;
    }

    const totalCost = equipmentCost + installationCost + transportCost;

    const estimate: CostEstimate = {
      intervention: selectedIntervention,
      community: community || "Selected Community",
      equipmentCost,
      transportCost,
      installationCost,
      totalCost,
      distanceKm,
      households,
      costPerHousehold:
        selectedIntervention === "grid_extension"
          ? totalCost / households
          : totalCost / households,
    };

    setCostEstimate(estimate);
  };

  const formatFJD = (n: number) =>
    `FJD ${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <div className="p-4 space-y-4">
      {/* Community */}
      <div>
        <label className="text-xs font-medium text-slate-500">Community</label>
        <div className="text-sm font-semibold text-slate-800 mt-0.5">
          {community || (
            <span className="text-slate-400 font-normal">
              Click a settlement on the map
            </span>
          )}
        </div>
      </div>

      {/* Intervention type */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Intervention Type
        </label>
        <select
          value={selectedIntervention}
          onChange={(e) => setIntervention(e.target.value as InterventionType)}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
        >
          {interventions.map((t) => (
            <option key={t} value={t}>
              {PRICING[t].label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">{pricing.description}</p>
      </div>

      {/* Households */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Households
        </label>
        <input
          type="number"
          value={households}
          onChange={(e) => setHouseholds(parseInt(e.target.value) || 1)}
          min={1}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
        />
      </div>

      {/* Distance override */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Distance (km){" "}
          {routeResult && (
            <span className="text-slate-400">
              — route: {routeResult.distanceKm.toFixed(1)} km
            </span>
          )}
        </label>
        <input
          type="number"
          value={distanceOverride}
          onChange={(e) => setDistanceOverride(e.target.value)}
          placeholder={
            routeResult ? routeResult.distanceKm.toFixed(1) : "100"
          }
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5"
        />
      </div>

      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Calculate Cost
      </button>

      {/* Results */}
      {costEstimate && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-sm text-slate-800">
            {costEstimate.community}
          </div>
          <div className="text-xs text-slate-500">
            {PRICING[costEstimate.intervention].label}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Equipment</span>
              <span>{formatFJD(costEstimate.equipmentCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Installation</span>
              <span>{formatFJD(costEstimate.installationCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transport ({costEstimate.distanceKm.toFixed(0)} km)</span>
              <span>{formatFJD(costEstimate.transportCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm border-t border-slate-200 pt-1 mt-1">
              <span>Total</span>
              <span>{formatFJD(costEstimate.totalCost)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Per household</span>
              <span>{formatFJD(costEstimate.costPerHousehold)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
