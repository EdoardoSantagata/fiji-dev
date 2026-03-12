# Fiji Infrastructure Planning Tool

Interactive map and logistics pricing tool for planning infrastructure upgrades (energy, water, telecom) across Fiji's communities, overlaid with poverty and vulnerability data to prioritize investments.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Interactive Map (`/map`)

Toggle data layers on/off from a sidebar. Click any feature to inspect its properties.

| Layer Group | Layers |
|-------------|--------|
| **Boundaries** | Provinces (15), Tikinas (86) |
| **Demographics** | Settlements (800+), Poverty choropleth (tikina-level) |
| **Energy** | Grid lines, Power plants, SHS communities (age-colored), FREF sites |
| **Infrastructure** | Roads (color-coded by class), Ports & jetties, Water points |
| **Telecom** | Cell towers with estimated coverage radius |
| **Facilities** | Schools, Health facilities |

Three base map options: CartoDB Light, OpenStreetMap, CartoDB Dark.

### Logistics & Pricing (`/pricing`)

Select a community on the map and estimate delivery/installation costs:

- **New SHS** — unit + transport + installation, scaled by distance
- **SHS Replacement** — battery/panel swap for aging systems
- **Solar Mini-Grid** — community-scale sizing based on household count
- **Grid Extension** — per-km line cost to nearest grid point

Route calculator computes road distance from major depots (Suva, Lautoka, Labasa, Savusavu, Nausori) via OSRM, with haversine fallback when routing is unavailable.

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Next.js 14 (App Router) |
| Map | React-Leaflet v5 + Leaflet |
| Spatial ops | Turf.js |
| Routing | OSRM (via `/api/routing` proxy) |
| Tiles | OpenStreetMap / CartoDB (free, no API key) |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Data pipeline | Python scripts (`scripts/`) |

## Project Structure

```
fiji-dev/
├── app/
│   ├── layout.tsx              # Root layout with Leaflet CSS
│   ├── page.tsx                # Landing page
│   ├── map/page.tsx            # Interactive map
│   ├── pricing/page.tsx        # Pricing calculator
│   └── api/
│       ├── layers/[layer]/route.ts   # Serve GeoJSON by layer name
│       └── routing/route.ts          # OSRM proxy
├── components/
│   ├── map/
│   │   ├── MapView.tsx         # Map + sidebar shell
│   │   ├── LayerControl.tsx    # Grouped layer toggles
│   │   ├── InfoPanel.tsx       # Feature property inspector
│   │   ├── Legend.tsx           # Dynamic legend
│   │   └── layers/             # One component per data layer
│   │       ├── BoundaryLayer.tsx
│   │       ├── SettlementsLayer.tsx
│   │       ├── EnergyLayer.tsx
│   │       ├── RoadsLayer.tsx
│   │       ├── FacilitiesLayer.tsx
│   │       ├── TelecomLayer.tsx
│   │       ├── WaterLayer.tsx
│   │       └── PovertyLayer.tsx
│   └── pricing/
│       ├── PricingView.tsx     # Pricing page shell
│       ├── CostEstimator.tsx   # Cost model UI
│       └── RouteDisplay.tsx    # Route calculator
├── lib/
│   ├── store.ts                # Zustand store (layers, selection, pricing)
│   ├── types.ts                # TypeScript interfaces
│   └── constants.ts            # Colors, pricing rates, layer configs
├── public/data/                # Static GeoJSON/JSON served directly
│   ├── boundaries/             # provinces.geojson, tikinas.geojson
│   ├── demographics/           # population JSON, poverty choropleth
│   ├── energy/                 # SHS, FREF, grid lines, power plants
│   ├── infrastructure/         # roads, schools, health, water, ports
│   ├── telecom/                # cell_towers.geojson
│   └── settlements/            # settlements.geojson
├── scripts/                    # Python data pipeline (see below)
├── pilot/                      # Original Folium pilot (preserved)
├── SOURCES.md                  # Full data provenance documentation
└── .env.local                  # API keys (OpenCelliD, OSRM URL)
```

## Data Pipeline

Python scripts fetch and convert geospatial data into the GeoJSON files served by the app. Some layers ship with pre-processed data; others need the scripts run to populate them.

### Pre-populated layers

These are already in `public/data/` from the pilot:

- Admin boundaries (provinces, tikinas)
- Settlements
- SHS communities (25 sites) and FREF sites (4 sites)
- Population by province and tikina
- Poverty choropleth (province-level rates from World Bank SAE)

### Fetch remaining layers

```bash
# Install Python dependencies
cd scripts
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Fetch from OSM (settlements, roads, ports)
python 03_fetch_osm_data.py

# Fetch from VanuaGIS (schools, health facilities)
python 04_fetch_vanuagis.py

# Fetch energy grid and power plants from OSM
python 05_fetch_energy_grid.py

# Fetch cell towers (needs OPENCELLID_API_KEY in .env.local, or falls back to OSM)
python 08_fetch_telecom.py

# Fetch water infrastructure from OSM
python 09_fetch_water.py
```

Scripts are numbered and can be run in any order. Each writes GeoJSON to `public/data/`. See `scripts/README.md` for details.

## Environment Variables

Copy `.env.local` and fill in as needed:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENCELLID_API_KEY` | Optional | Free key from [opencellid.org](https://opencellid.org) for cell tower data. Falls back to OSM if not set. |
| `OSRM_URL` | Optional | OSRM routing endpoint. Defaults to the public demo server. |

## Data Sources

All data sources are documented in [`SOURCES.md`](./SOURCES.md). Key sources:

- **HDX (OCHA)** — Admin boundaries, population census
- **OpenStreetMap** — Settlements, roads, power grid, water, ports, telecom towers
- **VanuaGIS** — Schools, health facilities (Fiji government ArcGIS REST)
- **World Bank** — Poverty estimates (SAE Report 93708-FJ), ENERGYDATA.INFO grid lines
- **OpenCelliD** — Cell tower locations (MCC 542)
- **Fiji DoE / FREF / UNDP** — Solar home systems, rural electrification sites

## License

Data licenses vary by source (CC-BY, ODbL, CC-BY-IGO). See `SOURCES.md` for per-dataset licensing.
