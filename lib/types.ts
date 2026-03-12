import type { FeatureCollection, Feature, Point, Polygon, MultiPolygon, LineString, MultiLineString } from "geojson";

// Layer group identifiers
export type LayerGroup = "boundaries" | "demographics" | "energy" | "infrastructure" | "telecom" | "facilities";

export type LayerId =
  | "provinces"
  | "tikinas"
  | "settlements"
  | "populationDensity"
  | "poverty"
  | "gridLines"
  | "powerPlants"
  | "shsCommunities"
  | "frefSites"
  | "roads"
  | "schools"
  | "healthFacilities"
  | "waterInfrastructure"
  | "portsJetties"
  | "cellTowers";

export interface LayerConfig {
  id: LayerId;
  label: string;
  group: LayerGroup;
  dataUrl: string;
  visible: boolean;
  color?: string;
}

// Feature property types
export interface SettlementProperties {
  name: string;
  place_type: string;
  population?: string | number;
}

export interface BoundaryProperties {
  ADM2_NAME?: string;
  ADM3_NAME?: string;
  ADM2_PCODE?: string;
  ADM3_PCODE?: string;
  ADM1_NAME?: string;
}

export interface SHSProperties {
  name: string;
  province?: string;
  tikina?: string;
  year_installed?: string;
  num_systems?: string;
  notes?: string;
}

export interface FREFProperties {
  name: string;
  island?: string;
  province?: string;
  status?: string;
  year?: string;
  num_households?: string;
  notes?: string;
}

export interface SchoolProperties {
  name: string;
  type?: string;
  province?: string;
}

export interface HealthFacilityProperties {
  name: string;
  type?: string;
  province?: string;
}

export interface RoadProperties {
  name?: string;
  highway?: string;
  surface?: string;
}

export interface CellTowerProperties {
  radio?: string;
  mcc?: number;
  net?: number;
  lat?: number;
  lon?: number;
}

export interface ProvincePopulation {
  code: string;
  name: string;
  division: string;
  total: number;
}

export interface TikinaPopulation {
  code: string;
  name: string;
  province: string;
  total: number;
}

// Pricing model types
export type InterventionType = "shs_new" | "shs_replacement" | "mini_grid" | "grid_extension";

export interface CostEstimate {
  intervention: InterventionType;
  community: string;
  equipmentCost: number;
  transportCost: number;
  installationCost: number;
  totalCost: number;
  distanceKm: number;
  households: number;
  costPerHousehold: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: LineString;
}

// GeoJSON typed collections
export type SettlementCollection = FeatureCollection<Point, SettlementProperties>;
export type BoundaryCollection = FeatureCollection<Polygon | MultiPolygon, BoundaryProperties>;
export type SHSCollection = FeatureCollection<Point, SHSProperties>;
export type FREFCollection = FeatureCollection<Point, FREFProperties>;
