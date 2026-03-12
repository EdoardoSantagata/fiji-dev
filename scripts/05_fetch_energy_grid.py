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

def fetch_power_plants():
    """Fetch power generation facilities from OSM."""
    query = f"""
    [out:json][timeout:60];
    (
      node["power"="plant"]({FIJI_BBOX});
      way["power"="plant"]({FIJI_BBOX});
      node["power"="generator"]({FIJI_BBOX});
    );
    out body center;
    """
    print("Fetching power plants from OSM...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    features = []
    for el in data["elements"]:
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        if lat and lon:
            tags = el.get("tags", {})
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "name": tags.get("name", "Power Facility"),
                    "power": tags.get("power", ""),
                    "generator_source": tags.get("generator:source", ""),
                    "generator_output": tags.get("generator:output:electricity", ""),
                    "operator": tags.get("operator", ""),
                },
            })

    geojson = {"type": "FeatureCollection", "features": features}

    out = OUT / "power_plants.geojson"
    with open(out, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(features)} power plants/generators saved")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    fetch_power_lines()
    fetch_power_plants()

if __name__ == "__main__":
    main()
