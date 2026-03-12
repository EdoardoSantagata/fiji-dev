import type { LayerConfig, LayerGroup, InterventionType } from "./types";

// Fiji center coordinates
export const FIJI_CENTER: [number, number] = [-17.7134, 178.065];
export const FIJI_ZOOM = 7;

// Tile layer options
export const TILE_URLS = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  cartodb_light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  cartodb_dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const;

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// Layer group labels and colors
export const LAYER_GROUPS: Record<LayerGroup, { label: string; color: string }> = {
  boundaries: { label: "Boundaries", color: "#6B7280" },
  demographics: { label: "Demographics", color: "#8B5CF6" },
  energy: { label: "Energy", color: "#F59E0B" },
  infrastructure: { label: "Infrastructure", color: "#3B82F6" },
  telecom: { label: "Telecom", color: "#10B981" },
  facilities: { label: "Facilities", color: "#EF4444" },
};

// All layer configurations
export const LAYERS: LayerConfig[] = [
  // Boundaries
  { id: "provinces", label: "Provinces", group: "boundaries", dataUrl: "/data/boundaries/provinces.geojson", visible: true, color: "#6B7280" },
  { id: "tikinas", label: "Tikinas", group: "boundaries", dataUrl: "/data/boundaries/tikinas.geojson", visible: false, color: "#9CA3AF" },
  // Demographics
  { id: "settlements", label: "Settlements", group: "demographics", dataUrl: "/data/settlements/settlements.geojson", visible: true, color: "#8B5CF6" },
  { id: "poverty", label: "Poverty (Tikina)", group: "demographics", dataUrl: "/data/demographics/poverty_tikina.geojson", visible: false, color: "#DC2626" },
  // Energy
  { id: "gridLines", label: "Grid Lines", group: "energy", dataUrl: "/data/energy/grid_lines.geojson", visible: false, color: "#F59E0B" },
  { id: "powerPlants", label: "Power Plants", group: "energy", dataUrl: "/data/energy/power_plants.geojson", visible: false, color: "#D97706" },
  { id: "shsCommunities", label: "SHS Communities", group: "energy", dataUrl: "/data/energy/shs_communities.geojson", visible: true, color: "#FBBF24" },
  { id: "frefSites", label: "FREF Sites", group: "energy", dataUrl: "/data/energy/fref_sites.geojson", visible: true, color: "#F97316" },
  // Infrastructure
  { id: "roads", label: "Roads", group: "infrastructure", dataUrl: "/data/infrastructure/roads.geojson", visible: false, color: "#3B82F6" },
  { id: "portsJetties", label: "Ports & Jetties", group: "infrastructure", dataUrl: "/data/infrastructure/ports_jetties.geojson", visible: false, color: "#0EA5E9" },
  { id: "waterInfrastructure", label: "Water Infrastructure", group: "infrastructure", dataUrl: "/data/infrastructure/water_infrastructure.geojson", visible: false, color: "#06B6D4" },
  // Telecom
  { id: "cellTowers", label: "Cell Towers", group: "telecom", dataUrl: "/data/telecom/cell_towers.geojson", visible: false, color: "#10B981" },
  // Facilities
  { id: "schools", label: "Schools", group: "facilities", dataUrl: "/data/infrastructure/schools.geojson", visible: false, color: "#3B82F6" },
  { id: "healthFacilities", label: "Health Facilities", group: "facilities", dataUrl: "/data/infrastructure/health_facilities.geojson", visible: false, color: "#EF4444" },
];

// Road colors by highway type
export const ROAD_COLORS: Record<string, string> = {
  motorway: "#E11D48",
  trunk: "#F97316",
  primary: "#EAB308",
  secondary: "#84CC16",
  tertiary: "#22C55E",
  residential: "#94A3B8",
  track: "#D4A574",
  default: "#9CA3AF",
};

// Poverty choropleth breaks
export const POVERTY_BREAKS = [
  { min: 0, max: 15, color: "#FEF3C7", label: "< 15%" },
  { min: 15, max: 25, color: "#FCD34D", label: "15–25%" },
  { min: 25, max: 35, color: "#F59E0B", label: "25–35%" },
  { min: 35, max: 50, color: "#DC2626", label: "35–50%" },
  { min: 50, max: 100, color: "#7F1D1D", label: "> 50%" },
];

// Settlement markers by place type
export const SETTLEMENT_SIZES: Record<string, number> = {
  city: 8,
  town: 6,
  village: 4,
  hamlet: 3,
  isolated_dwelling: 2,
};

// Energy pricing rates (FJD)
export const PRICING: Record<InterventionType, {
  label: string;
  unitCost: number;
  installationPerUnit: number;
  transportPerKm: number;
  description: string;
}> = {
  shs_new: {
    label: "New SHS Installation",
    unitCost: 2500,
    installationPerUnit: 500,
    transportPerKm: 15,
    description: "New solar home system (100W panel, battery, lights, phone charging)",
  },
  shs_replacement: {
    label: "SHS Battery/Panel Replacement",
    unitCost: 800,
    installationPerUnit: 200,
    transportPerKm: 15,
    description: "Replace aging batteries and/or panels on existing SHS",
  },
  mini_grid: {
    label: "Solar Mini-Grid",
    unitCost: 15000,
    installationPerUnit: 5000,
    transportPerKm: 50,
    description: "Community-scale solar + battery mini-grid (per household served)",
  },
  grid_extension: {
    label: "Grid Extension",
    unitCost: 25000,
    installationPerUnit: 0,
    transportPerKm: 0,
    description: "Per-km cost of MV line extension to nearest grid point",
  },
};
