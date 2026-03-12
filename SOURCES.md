# Data Sources — Fiji Infrastructure Planning Tool

All data is downloaded locally into `public/data/`. No external API calls are made at runtime.

Last fetched: 12 March 2026.

---

## File Inventory

| File | Features | Size | Source |
|------|----------|------|--------|
| `boundaries/provinces.geojson` | 15 | 15 MB | HDX OCHA (SHP reprojected to WGS84) |
| `boundaries/tikinas.geojson` | 86 | 16 MB | HDX OCHA (SHP reprojected to WGS84) |
| `demographics/population_province.json` | 15 | 4 KB | HDX Census 2017 (CSV → JSON) |
| `demographics/population_tikina.json` | 86 | 12 KB | HDX Census 2017 (CSV → JSON) |
| `demographics/poverty_tikina.geojson` | 86 | 16 MB | Tikina boundaries + World Bank SAE poverty rates |
| `energy/shs_communities.geojson` | 25 | 12 KB | Manual compilation (DoE, academic papers) |
| `energy/fref_sites.geojson` | 4 | 4 KB | Manual compilation (FREF, UNDP) |
| `energy/grid_lines.geojson` | 57 | 104 KB | OSM Overpass (power=line\|cable\|minor_line) |
| `energy/power_plants.geojson` | 56 | 16 KB | OSM Overpass (power=plant\|generator, excl. substations) |
| `energy/substations.geojson` | 22 | 4 KB | OSM Overpass (power=substation) |
| `infrastructure/roads.geojson` | 17,274 | 15 MB | OSM Overpass (highway=*) |
| `infrastructure/schools.geojson` | 1,016 | 328 KB | VanuaGIS Basemap2024/MapServer/3 |
| `infrastructure/health_facilities.geojson` | 215 | 60 KB | VanuaGIS MOH/MedicalZone/FeatureServer/1 |
| `infrastructure/ports_jetties.geojson` | 245 | 36 KB | OSM Overpass (ferry_terminal, pier, harbour) |
| `infrastructure/water_infrastructure.geojson` | 11 | 4 KB | OSM Overpass (drinking_water, water_well, etc.) |
| `settlements/settlements.geojson` | 670 | 136 KB | OSM Overpass (place=city\|town\|village\|hamlet) |
| `telecom/cell_towers.geojson` | 13 | 4 KB | OSM Overpass (communication towers) |

---

## Detailed Provenance

### Administrative Boundaries
- **Source**: OCHA via Humanitarian Data Exchange (HDX)
- **Dataset**: Fiji — Subnational Administrative Boundaries (COD-AB)
- **URL**: https://data.humdata.org/dataset/cod-ab-fji
- **Levels used**: Provinces (ADM2), Tikinas (ADM3)
- **Original format**: ESRI Shapefile in World Mercator (Central Meridian 150°E)
- **Processing**: Reprojected to EPSG:4326 (WGS84) using geopandas; antimeridian-crossing polygons (Cakaudrove, Lau, Macuata) fixed by shifting negative longitudes to lng+360
- **License**: CC-BY-IGO
- **Script**: `scripts/01_fetch_boundaries.py` (copies from pilot); reprojection done interactively with geopandas
- **Properties**: `ADM2_NAME`, `ADM2_PCODE`, `ADM1_NAME`, `ADM1_PCODE` (provinces); `ADM3_NAME`, `ADM3_PCODE`, plus parent province/division fields (tikinas)

### Population (2017 Census)
- **Source**: Fiji Bureau of Statistics via HDX
- **Dataset**: Fiji — Subnational Population Statistics
- **URL**: https://data.humdata.org/dataset/cod-ps-fji
- **Original files**: `fji_pop_province.csv`, `fji_pop_tikina.csv` (UTF-8 with BOM)
- **Processing**: Parsed with `csv.DictReader(encoding='utf-8-sig')`; extracted code, name, division/province, total population per admin unit
- **License**: CC-BY
- **Script**: `scripts/02_fetch_population.py`

### Poverty Estimates
- **Source**: World Bank Small Area Estimation (SAE)
- **Report**: "Republic of Fiji: Poverty Trends, Profiles and Small Area Estimation" (Report No. 93708-FJ)
- **Data**: Province-level poverty headcount rates (%) from Table 5.3 of the report
- **Processing**: Province rates assigned to all tikinas within each province (e.g., all tikinas in Ba get 28.3%). Province name `Nadroga_Navosa` in the boundary data matched to `Nadroga/Navosa` via underscore-to-slash normalization.
- **Rates used**: Ba 28.3%, Bua 42.7%, Cakaudrove 42.0%, Kadavu 38.1%, Lau 21.3%, Lomaiviti 29.1%, Macuata 44.3%, Nadroga/Navosa 39.9%, Naitasiri 22.5%, Namosi 24.6%, Ra 43.2%, Rewa 14.2%, Rotuma 10.2%, Serua 32.8%, Tailevu 32.4%
- **Limitation**: These are province-level averages, not true tikina-level estimates. The SAE report contains tikina-level data in appendix tables, but those require manual extraction from the PDF.
- **Script**: `scripts/07_fetch_poverty.py`

### Settlements
- **Source**: OpenStreetMap via Overpass API
- **Query**: All `place` nodes of type city, town, village, hamlet, isolated_dwelling within Fiji bounding box (-21.5, 176.0, -12.0, -179.0)
- **API endpoint**: https://overpass-api.de/api/interpreter
- **Features returned**: 670 settlements
- **Properties**: `name`, `place_type`, `population` (often empty)
- **License**: ODbL (OpenStreetMap)
- **Script**: `scripts/03_fetch_osm_data.py`

### Roads
- **Source**: OpenStreetMap via Overpass API
- **Query**: All `highway` ways of type motorway, trunk, primary, secondary, tertiary, residential, track
- **Features returned**: 17,274 road segments
- **Properties**: `name`, `highway` (road class), `surface`, `ref`
- **License**: ODbL
- **Script**: `scripts/03_fetch_osm_data.py`

### Ports & Jetties
- **Source**: OpenStreetMap via Overpass API
- **Query**: `amenity=ferry_terminal`, `man_made=pier`, `harbour=yes`
- **Features returned**: 245
- **License**: ODbL
- **Script**: `scripts/03_fetch_osm_data.py`

### Schools
- **Source**: VanuaGIS — Fiji Government Geospatial Portal
- **Service**: Basemap2024/MapServer, Layer 3 (Schools)
- **Endpoint**: `https://vanuagis.lands.gov.fj/arcgis/rest/services/Basemap2024/MapServer/3/query?where=1=1&outFields=*&f=geojson`
- **Features returned**: 1,016 schools
- **Properties**: `name` (school name), `type` (primary/secondary/etc.), `grade`, `province`, `division`, `district` (education district), `official_roll` (student count), `teachers` (teacher count)
- **Note**: SSL certificate on vanuagis.lands.gov.fj is not fully trusted; fetched with `verify=False`
- **Script**: `scripts/04_fetch_vanuagis.py` (updated from original LiveData endpoint which returned 404)

### Health Facilities
- **Source**: VanuaGIS — Ministry of Health
- **Service**: MOH/MedicalZone/FeatureServer, Layer 1 (Health_Facilities)
- **Endpoint**: `https://vanuagis.lands.gov.fj/arcgis/rest/services/MOH/MedicalZone/FeatureServer/1/query?where=1=1&outFields=*&f=geojson`
- **Features returned**: 215 health facilities
- **Properties**: `name`, `type` (Sub Divisional Hospital, Health Centre, Nursing Station, etc.), `sub_division`, `division`
- **Note**: MapServer version of same layer returned 0 features; FeatureServer works
- **Script**: `scripts/04_fetch_vanuagis.py` (updated endpoint)

### Electricity Grid Lines
- **Source**: OpenStreetMap via Overpass API
- **Query**: All `power=line|cable|minor_line` ways in Fiji bbox
- **Features returned**: 57 line segments
- **Properties**: `power` (line/cable), `voltage`, `operator`, `name`
- **License**: ODbL
- **Note**: OSM coverage of Fiji's grid is incomplete. The World Bank ENERGYDATA.INFO global T&D dataset (https://energydata.info/dataset/derived-map-global-electricity-transmission-and-distribution-lines) may provide additional coverage but requires GeoPackage extraction.
- **Script**: `scripts/05_fetch_energy_grid.py`

### Power Plants / Generators
- **Source**: OpenStreetMap via Overpass API
- **Query**: `power=plant` and `power=generator` nodes and ways; entries with `power=substation` or "substation" in name are separated into substations.geojson
- **Features returned**: 56 plants/generators (18 plants, 38 generators — mostly wind and solar)
- **Properties**: `name`, `power`, `voltage`, `generator_source` (solar, hydro, diesel, etc.), `generator_output`, `operator`
- **License**: ODbL
- **See also**: OpenInfraMap (https://openinframap.org)
- **Script**: `scripts/05_fetch_energy_grid.py`

### Substations
- **Source**: OpenStreetMap via Overpass API
- **Query**: `power=substation` nodes and ways, plus any `power=plant` features with "substation" in name
- **Features returned**: 22 substations
- **Properties**: `name`, `power`, `voltage`, `operator`
- **License**: ODbL
- **Script**: `scripts/05_fetch_energy_grid.py`

### Solar Home Systems (SHS)
- **Sources**:
  - Fiji Department of Energy: https://energy.gov.fj/shs-projects/
  - Urmee & Harries (2012), "The solar home PV program in Fiji", Renewable Energy 48, 499–506. DOI: 10.1016/j.renene.2012.06.017
- **Features**: 25 community/regional entries (some are regional aggregates covering many villages)
- **Properties**: `name`, `province`, `tikina`, `year_installed`, `num_systems`, `notes`
- **Limitation**: By 2014 over 5,700 SHS were installed across ~41+ villages; this dataset captures only publicly named sites. Detailed village-level data exists in internal DoE reports.
- **Script**: `scripts/06_fetch_shs_fref.py`

### FREF (Fiji Rural Electrification Fund)
- **Sources**:
  - FREF official: https://fref.com.fj/
  - UNDP Pacific: https://www.undp.org/pacific/projects/fiji-rural-electrification-fund-support-project
- **Features**: 4 sites (Vio Island pilot + 3 Phase 1 communities)
- **Properties**: `name`, `island`, `province`, `status`, `year`, `num_households`, `notes`
- **Limitation**: Only pilot + Phase 1 communities are publicly named
- **Script**: `scripts/06_fetch_shs_fref.py`

### Cell Towers
- **Current source**: OSM Overpass API (fallback — no OpenCelliD API key configured)
- **Query**: `man_made=mast|tower` with `tower:type=communication`, plus `communication:mobile_phone=yes`
- **Features returned**: 13 towers (very incomplete)
- **Primary source (not yet used)**: OpenCelliD (https://opencellid.org) — MCC=542 for Fiji. Requires free API key set as `OPENCELLID_API_KEY` in `.env.local`. Would provide hundreds of towers with radio type (GSM/UMTS/LTE).
- **License**: ODbL (OSM) / CC-BY-SA (OpenCelliD)
- **Script**: `scripts/08_fetch_telecom.py`

### Water Infrastructure
- **Source**: OpenStreetMap via Overpass API
- **Query**: `amenity=drinking_water`, `man_made=water_well|water_tower|water_works`, `amenity=water_point`
- **Features returned**: 11 (very sparse — OSM has minimal water infrastructure data for Fiji)
- **Properties**: `name`, `amenity`, `man_made`, `operator`, `drinking_water`
- **License**: ODbL
- **Note**: Comprehensive water network data would require a formal request to the Water Authority of Fiji (WAF)
- **Script**: `scripts/09_fetch_water.py`

---

## Known Data Gaps

| Layer | Current Count | Expected | Notes |
|-------|--------------|----------|-------|
| Cell towers | 13 | 200+ | Need OpenCelliD API key for full dataset |
| Water infrastructure | 11 | 100+ | OSM coverage is minimal; WAF data needed |
| SHS communities | 25 | 100+ | Only publicly documented sites; DoE has internal records |
| FREF sites | 4 | 75+ | CIF/REI Investment Plan identifies 75 priority sites |
| Grid lines | 57 | 200+ | OSM incomplete; World Bank ENERGYDATA.INFO may supplement |

---

## VanuaGIS Service Directory

Fiji's VanuaGIS portal (`vanuagis.lands.gov.fj`) ArcGIS REST services discovered on 12 March 2026:

- **Basemap2024/MapServer** — Schools (layer 3), Police Stations (4), Trig Stations, CCMS Roads, Hydrography
- **MOH/MedicalZone/FeatureServer** — Health Facilities (layer 1), Medical Zones (layer 0)
- **Emergency_Response/** — Physical Infrastructures, Transport (taxi/bus/carrier routes), Fire, Flooding, Landslides, Cyclones, Tsunami, Seismic
- **Provincial_Constituency/**, **Sugar_Information/**, **Parcels/** — Additional datasets not yet explored

Query pattern: `https://vanuagis.lands.gov.fj/arcgis/rest/services/{service}/MapServer/{layer}/query?where=1=1&outFields=*&f=geojson`

---

## Licenses

| Source | License |
|--------|---------|
| HDX / OCHA boundaries | CC-BY-IGO |
| HDX / Fiji BoS census | CC-BY |
| OpenStreetMap | ODbL |
| VanuaGIS (Fiji Government) | Government open data (no formal license stated) |
| World Bank reports | CC-BY 3.0 IGO |
| OpenCelliD | CC-BY-SA 4.0 |

---

## Electricity Access Statistics (Reference)

From 2017 Census via Georgetown Journal analysis:
- **Grid**: 92.9% urban / 60.3% rural
- **SHS**: 3.4% urban / 23.9% rural
- **No electricity**: 1.9% urban / 6.1% rural
