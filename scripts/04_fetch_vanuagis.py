#!/usr/bin/env python3
"""
Fetch schools, health facilities, and transport data from Fiji's VanuaGIS
ArcGIS REST services.

Source: vanuagis.lands.gov.fj/arcgis/rest/services/
"""

import json
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "infrastructure"

# VanuaGIS ArcGIS REST endpoints
BASE_URL = "https://vanuagis.lands.gov.fj/arcgis/rest/services"

# Known layer IDs (discovered via service directory)
LAYERS = {
    "schools": {
        "url": f"{BASE_URL}/LiveData/MapServer/52/query",
        "output": "schools.geojson",
    },
    "health": {
        "url": f"{BASE_URL}/LiveData/MapServer/53/query",
        "output": "health_facilities.geojson",
    },
    "roads_main": {
        "url": f"{BASE_URL}/LiveData/MapServer/33/query",
        "output": "roads_vanuagis.geojson",
    },
}

def fetch_arcgis_layer(url: str, name: str) -> dict:
    """Query an ArcGIS REST service layer and return GeoJSON."""
    params = {
        "where": "1=1",
        "outFields": "*",
        "f": "geojson",
        "returnGeometry": "true",
        "resultRecordCount": 5000,
    }

    print(f"Fetching {name} from VanuaGIS...")
    try:
        resp = requests.get(url, params=params, timeout=60, verify=False)
        resp.raise_for_status()
        data = resp.json()

        if "features" in data:
            print(f"  → {len(data['features'])} features")
            return data
        else:
            print(f"  → Unexpected response format")
            return {"type": "FeatureCollection", "features": []}
    except requests.RequestException as e:
        print(f"  → Error: {e}")
        return {"type": "FeatureCollection", "features": []}

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for name, config in LAYERS.items():
        geojson = fetch_arcgis_layer(config["url"], name)
        out_path = OUT / config["output"]
        with open(out_path, "w") as f:
            json.dump(geojson, f)
        print(f"  → Saved to {out_path}")

if __name__ == "__main__":
    main()
