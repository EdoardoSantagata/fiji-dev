#!/usr/bin/env python3
"""
Fetch schools and health facilities from Fiji's VanuaGIS ArcGIS REST services.

Sources:
- Schools: Basemap2024/MapServer/3
- Health:  MOH/MedicalZone/FeatureServer/1

Portal: https://vanuagis.lands.gov.fj/arcgis/rest/services/
"""

import json
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "infrastructure"

BASE_URL = "https://vanuagis.lands.gov.fj/arcgis/rest/services"

LAYERS = {
    "schools": {
        "url": f"{BASE_URL}/Basemap2024/MapServer/3/query",
        "output": "schools.geojson",
        "simplify": lambda p: {
            "name": p.get("School_Name") or p.get("Name", ""),
            "type": p.get("Type", ""),
            "grade": p.get("Grade", ""),
            "province": p.get("Province", ""),
            "division": p.get("Division", ""),
            "district": p.get("Education_District") or p.get("District", ""),
            "official_roll": p.get("Official_Roll", ""),
            "teachers": p.get("Teachers_Roll", ""),
        },
    },
    "health_facilities": {
        "url": f"{BASE_URL}/MOH/MedicalZone/FeatureServer/1/query",
        "output": "health_facilities.geojson",
        "simplify": lambda p: {
            "name": p.get("Name", ""),
            "type": p.get("Type", ""),
            "sub_division": p.get("Sub_Divisi", ""),
            "division": p.get("Division", ""),
        },
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

        # Simplify properties if a function is provided
        if "simplify" in config:
            for feat in geojson.get("features", []):
                feat["properties"] = config["simplify"](feat.get("properties", {}))

        out_path = OUT / config["output"]
        with open(out_path, "w") as f:
            json.dump(geojson, f)
        print(f"  → Saved to {out_path}")


if __name__ == "__main__":
    main()
