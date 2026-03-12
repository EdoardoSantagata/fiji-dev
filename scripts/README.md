# Data Processing Pipeline

Python scripts to fetch, process, and convert geospatial data for the Fiji Infrastructure Planning Tool.

## Setup

```bash
cd scripts
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Scripts

Run in order. Each outputs GeoJSON to `../public/data/`.

| Script | Output | Source |
|--------|--------|--------|
| `01_fetch_boundaries.py` | boundaries/*.geojson | HDX OCHA |
| `02_fetch_population.py` | demographics/*.json | HDX Census |
| `03_fetch_osm_data.py` | settlements, roads, water | OSM Overpass |
| `04_fetch_vanuagis.py` | schools, health, roads | VanuaGIS ArcGIS REST |
| `05_fetch_energy_grid.py` | energy/grid_lines.geojson | ENERGYDATA.INFO + OSM |
| `06_fetch_shs_fref.py` | energy/shs_*, fref_* | Manual CSV → GeoJSON |
| `07_fetch_poverty.py` | demographics/poverty_tikina.geojson | World Bank SAE |
| `08_fetch_telecom.py` | telecom/cell_towers.geojson | OpenCelliD |
| `09_fetch_water.py` | infrastructure/water_infrastructure.geojson | OSM Overpass |

## Notes

- Scripts 01-02 use pre-downloaded data from `../pilot/data/`
- Scripts 03, 05, 09 use OSM Overpass API (rate-limited, be patient)
- Script 04 queries VanuaGIS ArcGIS REST services
- Script 08 requires an OpenCelliD API key in `../.env.local`
- All outputs are GeoJSON (EPSG:4326)
