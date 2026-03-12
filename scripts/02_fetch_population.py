#!/usr/bin/env python3
"""
Convert population CSVs from HDX census data to JSON.

Source: Fiji Bureau of Statistics via HDX — https://data.humdata.org/dataset/cod-ps-fji
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PILOT = ROOT / "pilot" / "data" / "population"
OUT = ROOT / "public" / "data" / "demographics"

def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Province-level population
    rows = []
    with open(PILOT / "fji_pop_province.csv", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append({
                "code": row["ADM2_PCODE"],
                "name": row["ADM2_EN"].strip(),
                "division": row["ADM1_EN"],
                "total": int(row["T_TL"]),
                "male": int(row["M_TL"]),
                "female": int(row["F_TL"]),
            })
    with open(OUT / "population_province.json", "w") as f:
        json.dump(rows, f, indent=2)
    print(f"Province population: {len(rows)} records")

    # Tikina-level population
    rows = []
    with open(PILOT / "fji_pop_tikina.csv", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append({
                "code": row.get("ADM3_PCODE", ""),
                "name": row.get("ADM3_EN", "").strip(),
                "province": row.get("ADM2_EN", "").strip(),
                "total": int(row.get("T_TL", 0)),
            })
    with open(OUT / "population_tikina.json", "w") as f:
        json.dump(rows, f, indent=2)
    print(f"Tikina population: {len(rows)} records")

if __name__ == "__main__":
    main()
