# Fiji Interactive Map — Data Sources

## 1. Administrative Boundaries
- **Source**: OCHA via Humanitarian Data Exchange (HDX)
- **Dataset**: Fiji — Subnational Administrative Boundaries
- **URL**: https://data.humdata.org/dataset/cod-ab-fji
- **Files**:
  - `fji_polbnda_adm0_country.zip` — Country boundary (SHP)
  - `fji_polbnda_adm1_district.zip` — 4 Divisions (SHP)
  - `fji_polbnda_adm2_province.zip` — 15 Provinces (SHP)
  - `fji_polbnda_adm3_tikina.zip` — 86 Tikinas (SHP)
- **License**: CC-BY-IGO
- **Local path**: `data/boundaries/`

## 2. Population by Admin Level (2017 Census)
- **Source**: Fiji Bureau of Statistics via HDX
- **Dataset**: Fiji — Subnational Population Statistics
- **URL**: https://data.humdata.org/dataset/cod-ps-fji
- **Files**:
  - `fji_pplp_adm2_province_2017_v2.csv` — Province-level population
  - `fji_pplp_adm3_tikina_2017_v2.csv` — Tikina-level population
  - `fji_pplp_2017_census.xlsx` — All admin levels combined
- **License**: CC-BY
- **Local path**: `data/population/`

## 3. Settlements
- **Source**: OpenStreetMap via Overpass API
- **Query**: All place nodes (city, town, village, hamlet, isolated_dwelling) in Fiji bounding box
- **License**: ODbL
- **Local path**: `data/settlements/`

## 4. Solar Home Systems (SHS) Communities
- **Source**: Fiji Department of Energy (energy.gov.fj/shs-projects/)
- **Additional**: Urmee & Harries (2012), "The solar home PV program in Fiji", Renewable Energy 48, 499-506. DOI: 10.1016/j.renene.2012.06.017
- **Note**: Manually compiled from public sources; not exhaustive. By 2014, 5,700+ SHS installed across ~41 villages
- **Local path**: `data/shs_fref/shs_communities.csv`

## 5. FREF (Fiji Rural Electrification Fund) Recipients
- **Sources**:
  - FREF official site: https://fref.com.fj/
  - UNDP Pacific: https://www.undp.org/pacific/projects/fiji-rural-electrification-fund-support-project
  - Georgetown Journal: https://gjia.georgetown.edu/2025/08/11/powering-the-periphery-rethinking-rural-electrification-in-fiji/
- **Note**: Manually compiled; only pilot + Phase 1 communities publicly named
- **Local path**: `data/shs_fref/fref_communities.csv`

## 6. Electricity Access Statistics
- **Source**: 2017 Census via Georgetown Journal analysis
- **Key data**: Grid 92.9% urban / 60.3% rural; SHS 3.4% urban / 23.9% rural; No electricity 1.9% urban / 6.1% rural
- **Province-level**: Not freely available; would need request from Fiji Bureau of Statistics (statsfiji.gov.fj)
- **Approximation method**: Provinces classified by urbanization level to estimate electricity access

## 7. Population Density
- **Source**: Kontur Population via HDX
- **Dataset**: Fiji: Population Density for 400m H3 Hexagons
- **URL**: https://data.humdata.org/dataset/kontur-population-fiji
- **Alternative**: WorldPop 100m raster — https://data.humdata.org/dataset/worldpop-population-density-for-fiji
- **Local path**: `data/density/`
