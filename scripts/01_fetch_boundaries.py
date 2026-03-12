#!/usr/bin/env python3
"""
Fetch Fiji administrative boundaries from HDX and convert SHP → GeoJSON.

Source: OCHA via HDX — https://data.humdata.org/dataset/cod-ab-fji
Already downloaded in pilot/data/boundaries/. This script just copies the
pre-converted GeoJSON files to the public/data structure.
"""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PILOT = ROOT / "pilot" / "data" / "boundaries"
OUT = ROOT / "public" / "data" / "boundaries"

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    mappings = {
        "fji_adm2_province.geojson": "provinces.geojson",
        "fji_adm3_tikina.geojson": "tikinas.geojson",
    }

    for src_name, dst_name in mappings.items():
        src = PILOT / src_name
        dst = OUT / dst_name
        if src.exists():
            shutil.copy2(src, dst)
            print(f"Copied {src_name} → {dst_name}")
        else:
            print(f"WARNING: {src} not found")

if __name__ == "__main__":
    main()
