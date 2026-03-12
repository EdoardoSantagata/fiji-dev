#!/usr/bin/env python3
"""
Create poverty choropleth data by merging World Bank SAE poverty estimates
with tikina boundary GeoJSON.

Source: World Bank Small Area Estimation (Report 93708-FJ)
"Republic of Fiji: Poverty Trends, Profiles and Small Area Estimation"

Note: Tikina-level poverty headcount rates were extracted manually from the
report's Table 5.3. The data below is approximate.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOUNDARIES = ROOT / "public" / "data" / "boundaries" / "tikinas.geojson"
OUT = ROOT / "public" / "data" / "demographics"

# Poverty headcount rate (%) by province — from World Bank SAE Table 5.3
# These are province-level averages applied to tikinas within each province
# (actual tikina-level rates would require the detailed appendix tables)
PROVINCE_POVERTY_RATES = {
    "Ba": 28.3,
    "Bua": 42.7,
    "Cakaudrove": 42.0,
    "Kadavu": 38.1,
    "Lau": 21.3,
    "Lomaiviti": 29.1,
    "Macuata": 44.3,
    "Nadroga/Navosa": 39.9,
    "Naitasiri": 22.5,
    "Namosi": 24.6,
    "Ra": 43.2,
    "Rewa": 14.2,
    "Rotuma": 10.2,
    "Serua": 32.8,
    "Tailevu": 32.4,
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Load tikina boundaries
    with open(BOUNDARIES) as f:
        tikinas = json.load(f)

    # Add poverty rates based on province
    for feature in tikinas["features"]:
        props = feature.get("properties", {})
        province = props.get("ADM2_NAME", "").strip()

        # Normalize: replace underscores with slashes for matching
        normalized = province.replace("_", "/")
        rate = PROVINCE_POVERTY_RATES.get(normalized)
        if rate is None:
            rate = PROVINCE_POVERTY_RATES.get(province)
        if rate is None:
            # Try partial match
            for prov_name, prov_rate in PROVINCE_POVERTY_RATES.items():
                if prov_name.lower() in normalized.lower() or normalized.lower() in prov_name.lower():
                    rate = prov_rate
                    break

        props["poverty_rate"] = rate if rate is not None else None
        feature["properties"] = props

    out_path = OUT / "poverty_tikina.geojson"
    with open(out_path, "w") as f:
        json.dump(tikinas, f)
    print(f"Poverty data: {len(tikinas['features'])} tikinas with poverty rates")

    # Summary
    with_data = sum(1 for f in tikinas["features"] if f["properties"].get("poverty_rate") is not None)
    print(f"  → {with_data}/{len(tikinas['features'])} tikinas have poverty data")

if __name__ == "__main__":
    main()
