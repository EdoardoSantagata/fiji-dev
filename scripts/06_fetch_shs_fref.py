#!/usr/bin/env python3
"""
Convert SHS and FREF community CSVs to GeoJSON.

Sources:
- SHS: Fiji Department of Energy reports, Urmee & Harries (2012)
- FREF: FREF official site (fref.com.fj), UNDP Pacific
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PILOT = ROOT / "pilot" / "data" / "shs_fref"
OUT = ROOT / "public" / "data" / "energy"

def csv_to_geojson(csv_path: Path, lat_col: str = "lat", lon_col: str = "lon") -> dict:
    """Convert a CSV with lat/lon columns to GeoJSON."""
    features = []
    with open(csv_path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                lat = float(row[lat_col])
                lon = float(row[lon_col])
            except (ValueError, KeyError):
                continue
            props = {k: v for k, v in row.items() if k not in (lat_col, lon_col)}
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": props,
            })
    return {"type": "FeatureCollection", "features": features}

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # SHS communities
    shs = csv_to_geojson(PILOT / "shs_communities.csv")
    with open(OUT / "shs_communities.geojson", "w") as f:
        json.dump(shs, f, indent=2)
    print(f"SHS communities: {len(shs['features'])} features")

    # FREF sites
    fref = csv_to_geojson(PILOT / "fref_communities.csv")
    with open(OUT / "fref_sites.geojson", "w") as f:
        json.dump(fref, f, indent=2)
    print(f"FREF sites: {len(fref['features'])} features")

if __name__ == "__main__":
    main()
