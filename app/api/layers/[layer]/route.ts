import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const LAYER_PATHS: Record<string, string> = {
  provinces: "boundaries/provinces.geojson",
  tikinas: "boundaries/tikinas.geojson",
  settlements: "settlements/settlements.geojson",
  poverty: "demographics/poverty_tikina.geojson",
  grid_lines: "energy/grid_lines.geojson",
  power_plants: "energy/power_plants.geojson",
  substations: "energy/substations.geojson",
  shs_communities: "energy/shs_communities.geojson",
  fref_sites: "energy/fref_sites.geojson",
  roads: "infrastructure/roads.geojson",
  schools: "infrastructure/schools.geojson",
  health_facilities: "infrastructure/health_facilities.geojson",
  water_infrastructure: "infrastructure/water_infrastructure.geojson",
  ports_jetties: "infrastructure/ports_jetties.geojson",
  cell_towers: "telecom/cell_towers.geojson",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { layer: string } }
) {
  const layerPath = LAYER_PATHS[params.layer];
  if (!layerPath) {
    return NextResponse.json(
      { error: `Unknown layer: ${params.layer}` },
      { status: 404 }
    );
  }

  try {
    const filePath = join(process.cwd(), "public", "data", layerPath);
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/geo+json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: `Layer data not available: ${params.layer}` },
      { status: 404 }
    );
  }
}
