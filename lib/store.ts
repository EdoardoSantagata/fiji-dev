import { create } from "zustand";
import type { Feature } from "geojson";
import type { LayerId, InterventionType, CostEstimate, RouteResult } from "./types";
import { LAYERS } from "./constants";

interface LayerVisibility {
  [key: string]: boolean;
}

interface MapStore {
  // Layer visibility
  layerVisibility: LayerVisibility;
  toggleLayer: (id: LayerId) => void;
  setLayerVisibility: (id: LayerId, visible: boolean) => void;

  // Selected feature (for InfoPanel)
  selectedFeature: Feature | null;
  selectedLayerId: LayerId | null;
  selectFeature: (feature: Feature | null, layerId?: LayerId | null) => void;

  // Pricing
  selectedIntervention: InterventionType;
  setIntervention: (type: InterventionType) => void;
  costEstimate: CostEstimate | null;
  setCostEstimate: (estimate: CostEstimate | null) => void;

  // Routing
  routeOrigin: [number, number] | null;
  routeDestination: [number, number] | null;
  setRouteOrigin: (coords: [number, number] | null) => void;
  setRouteDestination: (coords: [number, number] | null) => void;
  routeResult: RouteResult | null;
  setRouteResult: (result: RouteResult | null) => void;

  // Base tile
  baseTile: "osm" | "cartodb_light" | "cartodb_dark";
  setBaseTile: (tile: "osm" | "cartodb_light" | "cartodb_dark") => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Initialize visibility from layer configs
const initialVisibility: LayerVisibility = {};
for (const layer of LAYERS) {
  initialVisibility[layer.id] = layer.visible;
}

export const useMapStore = create<MapStore>((set) => ({
  layerVisibility: initialVisibility,
  toggleLayer: (id) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [id]: !state.layerVisibility[id],
      },
    })),
  setLayerVisibility: (id, visible) =>
    set((state) => ({
      layerVisibility: { ...state.layerVisibility, [id]: visible },
    })),

  selectedFeature: null,
  selectedLayerId: null,
  selectFeature: (feature, layerId = null) =>
    set({ selectedFeature: feature, selectedLayerId: layerId }),

  selectedIntervention: "shs_new",
  setIntervention: (type) => set({ selectedIntervention: type }),
  costEstimate: null,
  setCostEstimate: (estimate) => set({ costEstimate: estimate }),

  routeOrigin: null,
  routeDestination: null,
  setRouteOrigin: (coords) => set({ routeOrigin: coords }),
  setRouteDestination: (coords) => set({ routeDestination: coords }),
  routeResult: null,
  setRouteResult: (result) => set({ routeResult: result }),

  baseTile: "cartodb_light",
  setBaseTile: (tile) => set({ baseTile: tile }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
