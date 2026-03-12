#!/usr/bin/env python3
"""
Fetch water infrastructure from OSM Overpass API.

Source: OpenStreetMap — amenity=drinking_water, man_made=water_well,
        man_made=water_tower, man_made=water_works, etc.
"""

import json
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "infrastructure"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
FIJI_BBOX = "-21.5,176.0,-12.0,-179.0"

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    query = f"""
    [out:json][timeout:90];
    (
      node["amenity"="drinking_water"]({FIJI_BBOX});
      node["man_made"="water_well"]({FIJI_BBOX});
      node["man_made"="water_tower"]({FIJI_BBOX});
      node["man_made"="water_works"]({FIJI_BBOX});
      node["amenity"="water_point"]({FIJI_BBOX});
      way["man_made"="water_works"]({FIJI_BBOX});
    );
    out body center;
    """

    print("Fetching water infrastructure from OSM...")
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
                    "name": tags.get("name", ""),
                    "amenity": tags.get("amenity", ""),
                    "man_made": tags.get("man_made", ""),
                    "operator": tags.get("operator", ""),
                    "drinking_water": tags.get("drinking_water", ""),
                },
            })

    geojson = {"type": "FeatureCollection", "features": features}

    out_path = OUT / "water_infrastructure.geojson"
    with open(out_path, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(features)} water infrastructure features saved")

if __name__ == "__main__":
    main()
