# Data Sources — Fiji Infrastructure Planning Tool

## Tier 1: Freely Available

### Administrative Boundaries
- **Source**: OCHA via Humanitarian Data Exchange (HDX)
- **Dataset**: Fiji — Subnational Administrative Boundaries (COD-AB)
- **URL**: https://data.humdata.org/dataset/cod-ab-fji
- **Levels**: Country (ADM0), Divisions (ADM1), Provinces (ADM2), Tikinas (ADM3)
- **Format**: SHP → GeoJSON
- **License**: CC-BY-IGO
- **Script**: `scripts/01_fetch_boundaries.py`

### Population (2017 Census)
- **Source**: Fiji Bureau of Statistics via HDX
- **Dataset**: Fiji — Subnational Population Statistics
- **URL**: https://data.humdata.org/dataset/cod-ps-fji
- **Format**: CSV → JSON
- **License**: CC-BY
- **Script**: `scripts/02_fetch_population.py`

### Population Density
- **Source**: Kontur via HDX
- **Dataset**: Fiji: Population Density for 400m H3 Hexagons
- **URL**: https://data.humdata.org/dataset/kontur-population-fiji
- **Format**: GeoPackage
- **Alternative**: WorldPop 100m raster (https://data.humdata.org/dataset/worldpop-population-density-for-fiji)

### Settlements
- **Source**: OpenStreetMap via Overpass API
- **Query**: place=city|town|village|hamlet|isolated_dwelling in Fiji bbox
- **License**: ODbL
- **Script**: `scripts/03_fetch_osm_data.py`

### Roads
- **Source**: OpenStreetMap via Overpass API
- **Alternative**: Geofabrik OSM extract (https://download.geofabrik.de/australia-oceania/fiji.html)
- **License**: ODbL
- **Script**: `scripts/03_fetch_osm_data.py`

### Schools
- **Source**: VanuaGIS ArcGIS REST Service (Fiji Government)
- **Endpoint**: vanuagis.lands.gov.fj/arcgis/rest/services/LiveData/MapServer/52
- **Format**: ArcGIS JSON → GeoJSON
- **Script**: `scripts/04_fetch_vanuagis.py`

### Health Facilities
- **Source**: VanuaGIS ArcGIS REST Service
- **Endpoint**: vanuagis.lands.gov.fj/arcgis/rest/services/LiveData/MapServer/53
- **Script**: `scripts/04_fetch_vanuagis.py`

### Transport / Roads (VanuaGIS)
- **Source**: VanuaGIS ArcGIS REST Service
- **Endpoint**: vanuagis.lands.gov.fj/arcgis/rest/services/LiveData/MapServer/33
- **Script**: `scripts/04_fetch_vanuagis.py`

### Electricity Grid Lines
- **Source**: OpenStreetMap (power=line|cable) + World Bank ENERGYDATA.INFO
- **ENERGYDATA URL**: https://energydata.info/dataset/derived-map-global-electricity-transmission-and-distribution-lines
- **License**: ODbL (OSM) / CC-BY-4.0 (World Bank)
- **Script**: `scripts/05_fetch_energy_grid.py`

### Power Plants / Generators
- **Source**: OpenStreetMap (power=plant|generator)
- **See also**: OpenInfraMap (https://openinframap.org)
- **Script**: `scripts/05_fetch_energy_grid.py`

### Solar Home Systems (SHS)
- **Sources**:
  - Fiji Department of Energy (https://energy.gov.fj/shs-projects/)
  - Urmee & Harries (2012), "The solar home PV program in Fiji", Renewable Energy 48, 499–506
  - By 2014: 5,700+ SHS across ~41 villages
- **Note**: Manually compiled from public sources
- **Script**: `scripts/06_fetch_shs_fref.py`

### FREF (Fiji Rural Electrification Fund)
- **Sources**:
  - FREF official: https://fref.com.fj/
  - UNDP Pacific: https://www.undp.org/pacific/projects/fiji-rural-electrification-fund-support-project
- **Note**: Only pilot + Phase 1 communities publicly named
- **Script**: `scripts/06_fetch_shs_fref.py`

### Poverty Estimates (Tikina/Province Level)
- **Source**: World Bank Small Area Estimation (SAE)
- **Report**: "Republic of Fiji: Poverty Trends, Profiles and Small Area Estimation" (Report 93708-FJ)
- **URL**: https://documents.worldbank.org (search 93708-FJ)
- **Note**: Province-level headcount rates extracted from Table 5.3; applied to tikinas within each province
- **Script**: `scripts/07_fetch_poverty.py`

### Cell Towers
- **Primary**: OpenCelliD (https://opencellid.org) — MCC=542 (Fiji)
- **Fallback**: OSM telecom towers
- **API Key Required**: Yes (free registration at opencellid.org)
- **Script**: `scripts/08_fetch_telecom.py`

### Water Infrastructure
- **Source**: OpenStreetMap (drinking_water, water_well, water_tower, water_works)
- **License**: ODbL
- **Script**: `scripts/09_fetch_water.py`

### Ports & Jetties
- **Source**: OpenStreetMap (ferry_terminal, pier, harbour)
- **Script**: `scripts/03_fetch_osm_data.py`

---

## Tier 2: Requires Registration or Manual Extraction

| Layer | Source | Notes |
|-------|--------|-------|
| SHS detailed village data | Fiji DoE annual reports | 75 priority sites in CIF/REI Investment Plan |
| Telecom coverage polygons | Vodafone/Digicel/nperf.com | Viewable maps, polygons not downloadable |
| Water network (WAF) | Water Authority of Fiji | May need formal data request |
| Maritime routes | MSAF / Fiji Ports Corp | Not digitized; port locations from OSM |

---

## Tier 3: VanuaGIS Discovery

Fiji government's **VanuaGIS** portal (vanuagis.lands.gov.fj) exposes ArcGIS REST services with:
- Schools, health facilities, police, fire stations
- Transport layers (roads by class)
- Towers, commercial centers
- Land parcels

Query pattern: `{service_url}/query?where=1=1&outFields=*&f=geojson`

---

## Electricity Access Statistics (Reference)

From 2017 Census via Georgetown Journal analysis:
- **Grid**: 92.9% urban / 60.3% rural
- **SHS**: 3.4% urban / 23.9% rural
- **No electricity**: 1.9% urban / 6.1% rural
