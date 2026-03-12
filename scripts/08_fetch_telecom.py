#!/usr/bin/env python3
"""
Fetch cell tower data for Fiji from OpenCelliD.

Source: OpenCelliD — https://opencellid.org
Fiji MCC: 542 (Vodafone=01, Digicel=02)

Requires API key in ../.env.local as OPENCELLID_API_KEY
"""

import csv
import io
import json
import os
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "telecom"

# Load API key from .env.local
def load_env():
    env_path = ROOT / ".env.local"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())

def fetch_from_opencellid(api_key: str) -> dict:
    """Fetch Fiji cell towers from OpenCelliD API."""
    url = "https://opencellid.org/cell/getInArea"
    params = {
        "key": api_key,
        "BBOX": "-21.5,176.0,-12.0,-179.0",  # Fiji bounding box
        "mcc": 542,
        "format": "json",
        "limit": 10000,
    }

    print("Fetching cell towers from OpenCelliD...")
    resp = requests.get(url, params=params, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    features = []
    cells = data.get("cells", [])
    for cell in cells:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [cell["lon"], cell["lat"]],
            },
            "properties": {
                "radio": cell.get("radio", ""),
                "mcc": cell.get("mcc", 542),
                "net": cell.get("net", ""),
                "cell": cell.get("cell", ""),
                "range": cell.get("range", ""),
                "samples": cell.get("samples", ""),
            },
        })

    return {"type": "FeatureCollection", "features": features}

def fetch_from_osm_fallback() -> dict:
    """Fallback: fetch telecom towers from OSM."""
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"
    FIJI_BBOX = "-21.5,176.0,-12.0,-179.0"

    query = f"""
    [out:json][timeout:60];
    (
      node["man_made"="mast"]["tower:type"="communication"]({FIJI_BBOX});
      node["man_made"="tower"]["tower:type"="communication"]({FIJI_BBOX});
      node["communication:mobile_phone"="yes"]({FIJI_BBOX});
    );
    out body;
    """
    print("Falling back to OSM for telecom towers...")
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    features = []
    for el in data["elements"]:
        if "lat" in el and "lon" in el:
            tags = el.get("tags", {})
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [el["lon"], el["lat"]]},
                "properties": {
                    "radio": "Unknown",
                    "operator": tags.get("operator", ""),
                    "name": tags.get("name", ""),
                },
            })

    return {"type": "FeatureCollection", "features": features}

def main():
    load_env()
    OUT.mkdir(parents=True, exist_ok=True)

    api_key = os.environ.get("OPENCELLID_API_KEY")

    if api_key:
        geojson = fetch_from_opencellid(api_key)
    else:
        print("No OPENCELLID_API_KEY found, using OSM fallback...")
        geojson = fetch_from_osm_fallback()

    out_path = OUT / "cell_towers.geojson"
    with open(out_path, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(geojson['features'])} cell towers saved")

if __name__ == "__main__":
    main()
