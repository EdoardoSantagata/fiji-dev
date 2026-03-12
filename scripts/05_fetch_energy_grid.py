#!/usr/bin/env python3
"""
Fetch electricity grid/transmission lines for Fiji.

Sources:
- OSM Overpass API (power lines tagged power=line/cable)
- World Bank ENERGYDATA.INFO global T&D dataset (backup)
"""

import json
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "energy"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
FIJI_BBOX = "-21.5,176.0,-12.0,-179.0"

def fetch_power_lines():
    """Fetch power lines from OSM."""
    query = f"""
    [out:json][timeout:120];
    (
      way["power"~"line|cable|minor_line"]({FIJI_BBOX});
    );
    out body geom;
    """
    print("Fetching power lines from OSM...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=180)
    resp.raise_for_status()
    data = resp.json()

    features = []
    for el in data["elements"]:
        if "geometry" in el:
            coords = [[pt["lon"], pt["lat"]] for pt in el["geometry"]]
            tags = el.get("tags", {})
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": coords},
                "properties": {
                    "power": tags.get("power", "line"),
                    "voltage": tags.get("voltage", ""),
                    "operator": tags.get("operator", ""),
                    "name": tags.get("name", ""),
                },
            })

    geojson = {"type": "FeatureCollection", "features": features}

    out = OUT / "grid_lines.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(features)} power line segments saved")

def fetch_power_facilities():
    """Fetch power plants, generators, and substations from OSM — save as separate files."""
    query = f"""
    [out:json][timeout:90];
    (
      node["power"="plant"]({FIJI_BBOX});
      way["power"="plant"]({FIJI_BBOX});
      node["power"="generator"]({FIJI_BBOX});
      node["power"="substation"]({FIJI_BBOX});
      way["power"="substation"]({FIJI_BBOX});
    );
    out body center;
    """
    print("Fetching power facilities from OSM...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    plants = []
    substations = []

    for el in data["elements"]:
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        if not (lat and lon):
            continue

        tags = el.get("tags", {})
        power_tag = tags.get("power", "")
        name = tags.get("name", "")

        # Classify: if tagged as substation, or name contains "substation"
        is_substation = (
            power_tag == "substation"
            or "substation" in name.lower()
        )

        feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "name": name or ("Substation" if is_substation else "Power Facility"),
                "power": power_tag,
                "voltage": tags.get("voltage", ""),
                "generator_source": tags.get("generator:source", ""),
                "generator_output": tags.get("generator:output:electricity", ""),
                "operator": tags.get("operator", ""),
            },
        }

        if is_substation:
            substations.append(feature)
        else:
            plants.append(feature)

    # Save power plants / generators
    with open(OUT / "power_plants.geojson", "w") as f:
        json.dump({"type": "FeatureCollection", "features": plants}, f)
    print(f"  → {len(plants)} power plants/generators saved")

    # Save substations
    with open(OUT / "substations.geojson", "w") as f:
        json.dump({"type": "FeatureCollection", "features": substations}, f)
    print(f"  → {len(substations)} substations saved")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    fetch_power_lines()
    fetch_power_facilities()

if __name__ == "__main__":
    main()
