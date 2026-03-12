#!/usr/bin/env python3
"""
Fetch Fiji settlements, roads, and POIs from OpenStreetMap via Overpass API.

Source: OpenStreetMap — https://overpass-api.de
"""

import json
import time
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Fiji bounding box (approx)
FIJI_BBOX = "-21.5,176.0,-12.0,-179.0"

def overpass_query(query: str) -> dict:
    """Execute an Overpass query and return the JSON result."""
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    return resp.json()

def elements_to_geojson(elements: list, geom_type: str = "Point") -> dict:
    """Convert Overpass elements to a GeoJSON FeatureCollection."""
    features = []
    for el in elements:
        if geom_type == "Point" and "lat" in el and "lon" in el:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [el["lon"], el["lat"]]},
                "properties": el.get("tags", {}),
            })
        elif geom_type == "LineString" and "geometry" in el:
            coords = [[pt["lon"], pt["lat"]] for pt in el["geometry"]]
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": coords},
                "properties": el.get("tags", {}),
            })
    return {"type": "FeatureCollection", "features": features}

def fetch_settlements():
    """Fetch place nodes (city, town, village, hamlet)."""
    query = f"""
    [out:json][timeout:90];
    (
      node["place"~"city|town|village|hamlet|isolated_dwelling"]({FIJI_BBOX});
    );
    out body;
    """
    print("Fetching settlements...")
    data = overpass_query(query)
    geojson = elements_to_geojson(data["elements"])

    # Normalize properties
    for f in geojson["features"]:
        props = f["properties"]
        f["properties"] = {
            "name": props.get("name", "Unknown"),
            "place_type": props.get("place", "village"),
            "population": props.get("population", ""),
        }

    out = OUT / "settlements" / "settlements.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(geojson['features'])} settlements saved")

def fetch_roads():
    """Fetch road network."""
    query = f"""
    [out:json][timeout:120];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|track"]({FIJI_BBOX});
    );
    out body geom;
    """
    print("Fetching roads...")
    data = overpass_query(query)
    geojson = elements_to_geojson(data["elements"], "LineString")

    # Normalize properties
    for f in geojson["features"]:
        props = f["properties"]
        f["properties"] = {
            "name": props.get("name", ""),
            "highway": props.get("highway", ""),
            "surface": props.get("surface", ""),
            "ref": props.get("ref", ""),
        }

    out = OUT / "infrastructure" / "roads.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(geojson['features'])} road segments saved")

def fetch_ports():
    """Fetch ports and jetties."""
    query = f"""
    [out:json][timeout:60];
    (
      node["amenity"="ferry_terminal"]({FIJI_BBOX});
      node["man_made"="pier"]({FIJI_BBOX});
      node["harbour"="yes"]({FIJI_BBOX});
      way["man_made"="pier"]({FIJI_BBOX});
    );
    out body center;
    """
    print("Fetching ports & jetties...")
    data = overpass_query(query)
    # For ways, use center coordinates
    elements = []
    for el in data["elements"]:
        if "lat" in el:
            elements.append(el)
        elif "center" in el:
            el["lat"] = el["center"]["lat"]
            el["lon"] = el["center"]["lon"]
            elements.append(el)
    geojson = elements_to_geojson(elements)

    out = OUT / "infrastructure" / "ports_jetties.geojson"
    with open(out, "w") as f:
        json.dump(geojson, f)
    print(f"  → {len(geojson['features'])} port/jetty features saved")

def main():
    fetch_settlements()
    time.sleep(5)  # Rate limit
    fetch_roads()
    time.sleep(5)
    fetch_ports()

if __name__ == "__main__":
    main()
