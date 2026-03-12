#!/usr/bin/env python3
"""Build interactive Fiji map with toggleable layers in grouped subsections."""

import geopandas as gpd
import pandas as pd
import folium
from folium.plugins import MarkerCluster, GroupedLayerControl
import json
import csv

BASE = "/Users/edoardosantagata/Desktop/fiji-dev"

# ── 1. Load admin boundaries ──────────────────────────────────────────
print("Loading boundaries...")
provinces = gpd.read_file(f"{BASE}/data/boundaries/fji_adm2_province.geojson")
tikinas = gpd.read_file(f"{BASE}/data/boundaries/fji_adm3_tikina.geojson")

# ── 2. Load population data & merge ──────────────────────────────────
print("Loading population data...")
pop_prov = pd.read_csv(f"{BASE}/data/population/fji_pop_province.csv")
pop_tik = pd.read_csv(f"{BASE}/data/population/fji_pop_tikina.csv")

provinces = provinces.merge(
    pop_prov[["ADM2_PCODE", "T_TL", "M_TL", "F_TL"]],
    on="ADM2_PCODE", how="left"
)
provinces.rename(columns={"T_TL": "population"}, inplace=True)

tikinas = tikinas.merge(
    pop_tik[["ADM3_PCODE", "T_TL", "M_TL", "F_TL"]],
    on="ADM3_PCODE", how="left"
)
tikinas.rename(columns={"T_TL": "population"}, inplace=True)

# Compute area in km² and density
provinces_proj = provinces.to_crs(epsg=3460)  # Fiji Map Grid
provinces["area_km2"] = provinces_proj.geometry.area / 1e6
provinces["pop_density"] = provinces["population"] / provinces["area_km2"]

tikinas_proj = tikinas.to_crs(epsg=3460)
tikinas["area_km2"] = tikinas_proj.geometry.area / 1e6
tikinas["pop_density"] = tikinas["population"] / tikinas["area_km2"]

# ── 3. Electricity access estimates by province ──────────────────────
urban_provinces = {"Ba", "Naitasiri", "Rewa"}
semi_urban = {"Tailevu", "Macuata", "Nadroga/Navosa", "Serua"}

def estimate_electricity(name):
    if name in urban_provinces:
        return {"grid": 90, "shs": 4, "diesel": 0.5, "none": 2, "category": "Urban"}
    elif name in semi_urban:
        return {"grid": 75, "shs": 12, "diesel": 2, "none": 4, "category": "Semi-urban"}
    else:
        return {"grid": 55, "shs": 25, "diesel": 5, "none": 8, "category": "Rural"}

elec_data = provinces["ADM2_NAME"].apply(lambda x: pd.Series(estimate_electricity(x)))
provinces = pd.concat([provinces, elec_data], axis=1)
provinces["total_access"] = provinces["grid"] + provinces["shs"] + provinces["diesel"]

# ── 4. Load settlements ──────────────────────────────────────────────
print("Loading settlements...")
with open(f"{BASE}/data/settlements/fiji_settlements.geojson") as f:
    settlements_geojson = json.load(f)

# ── 5. Load SHS communities ─────────────────────────────────────────
print("Loading SHS data...")
shs_communities = []
with open(f"{BASE}/data/shs_fref/shs_communities.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["lat"] and row["lon"]:
            shs_communities.append(row)

# ── 6. Load FREF communities ────────────────────────────────────────
print("Loading FREF data...")
fref_communities = []
with open(f"{BASE}/data/shs_fref/fref_communities.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["lat"] and row["lon"]:
            fref_communities.append(row)

# ── 7. Load population density (Kontur H3) ──────────────────────────
print("Loading population density hexagons...")
kontur = gpd.read_file(f"{BASE}/data/density/kontur_population_FJ.gpkg")
kontur = kontur.to_crs(epsg=4326)
kontur_high = kontur[kontur["population"] >= 50].copy()
print(f"  {len(kontur_high)} hexagons with pop >= 50 (of {len(kontur)} total)")

# ── 8. Build the map ────────────────────────────────────────────────
print("Building map...")
m = folium.Map(
    location=[-17.8, 178.0],
    zoom_start=7,
    tiles="CartoDB positron",
    control_scale=True,
)

provinces_wgs = provinces.to_crs(epsg=4326)
tikinas_wgs = tikinas.to_crs(epsg=4326)

# ═══════════════════════════════════════════════════════════════════════
# ENERGY LAYERS
# ═══════════════════════════════════════════════════════════════════════

# ── Electricity Access (Province Choropleth) ─────────────────────────
elec_layer = folium.FeatureGroup(name="Electricity Access (Province)", show=True)

def elec_style(feature):
    access = feature["properties"].get("total_access") or 80
    if access >= 90:
        color = "#2ecc71"
    elif access >= 80:
        color = "#f1c40f"
    elif access >= 70:
        color = "#e67e22"
    else:
        color = "#e74c3c"
    return {"fillColor": color, "color": "#333", "weight": 1.5, "fillOpacity": 0.45}

elec_gj = json.loads(provinces_wgs.to_json())
for feat in elec_gj["features"]:
    props = feat["properties"]
    name = props.get("ADM2_NAME", "")
    est = estimate_electricity(name)
    props.update(est)
    props["total_access"] = est["grid"] + est["shs"] + est["diesel"]

folium.GeoJson(
    elec_gj,
    style_function=elec_style,
    tooltip=folium.GeoJsonTooltip(
        fields=["ADM2_NAME", "population", "category", "grid", "shs", "diesel", "none", "total_access"],
        aliases=["Province", "Population", "Type", "Grid %", "SHS %", "Diesel %", "No Electricity %", "Total Access %"],
        sticky=True,
    ),
).add_to(elec_layer)
elec_layer.add_to(m)

# ── SHS Communities ──────────────────────────────────────────────────
shs_layer = folium.FeatureGroup(name="Solar Home Systems (SHS)", show=True)

SHS_COLORS = {
    "oldest": "#8b0000",   # darkred — <=2002
    "old": "#e67e22",      # orange — 2003-2005
    "mixed": "#3498db",    # blue — multi-year regional aggregates
    "newer": "#27ae60",    # green — post-2005
    "unknown": "#888888",  # gray
}

def shs_color_hex(year_str):
    try:
        year = int(year_str)
        if year <= 2002:
            return SHS_COLORS["oldest"]
        elif year <= 2005:
            return SHS_COLORS["old"]
        else:
            return SHS_COLORS["newer"]
    except (ValueError, TypeError):
        if year_str and "-" in str(year_str):
            return SHS_COLORS["mixed"]
        return SHS_COLORS["unknown"]

def shs_age_label(year_str):
    try:
        year = int(year_str)
        return f"~{2026 - year} years old"
    except:
        if year_str and "-" in str(year_str):
            return f"Installed {year_str}"
        return "Unknown age"

for comm in shs_communities:
    lat = float(comm["lat"])
    lon = float(comm["lon"])
    name = comm["name"]
    year = comm["year_installed"]
    systems = comm["num_systems"]
    notes = comm["notes"]
    province = comm["province"]
    age = shs_age_label(year)
    color = shs_color_hex(year)
    is_aggregate = "(aggregate)" in name

    # Bigger radius for regional aggregates
    if is_aggregate:
        radius = 14
        weight = 2
    else:
        radius = 7
        weight = 1.5

    popup_html = f"""
    <div style='width:220px'>
        <b>{name}</b><br>
        Province: {province}<br>
        Year: {year if year else 'Unknown'}<br>
        Systems: {systems if systems else 'N/A'}<br>
        Age: {age}<br>
        {'<i>' + notes + '</i>' if notes else ''}
    </div>
    """

    folium.CircleMarker(
        location=[lat, lon],
        radius=radius,
        color=color,
        fill=True,
        fillColor=color,
        fillOpacity=0.75,
        weight=weight,
        popup=folium.Popup(popup_html, max_width=250),
        tooltip=f"SHS: {name} ({age})",
    ).add_to(shs_layer)

shs_layer.add_to(m)

# ── FREF Communities ─────────────────────────────────────────────────
fref_layer = folium.FeatureGroup(name="FREF Recipients", show=True)

FREF_COLORS = {"Pilot": "#2980b9", "Phase 1": "#27ae60", "Planned": "#e67e22"}

for comm in fref_communities:
    lat = float(comm["lat"])
    lon = float(comm["lon"])
    name = comm["name"]
    island = comm["island"]
    status = comm["status"]
    year = comm["year"]
    hh = comm["num_households"]
    notes = comm["notes"]
    color = FREF_COLORS.get(status, "#888")

    popup_html = f"""
    <div style='width:220px'>
        <b>{name}</b><br>
        Island: {island}<br>
        Status: {status}<br>
        Year: {year}<br>
        Households: {hh if hh else 'TBD'}<br>
        {'<i>' + notes + '</i>' if notes else ''}
    </div>
    """

    folium.Marker(
        location=[lat, lon],
        popup=folium.Popup(popup_html, max_width=260),
        tooltip=f"FREF: {name} ({status})",
        icon=folium.Icon(color="green" if status == "Phase 1" else "blue" if status == "Pilot" else "orange",
                         icon="bolt", prefix="fa"),
    ).add_to(fref_layer)

fref_layer.add_to(m)

# ═══════════════════════════════════════════════════════════════════════
# DEMOGRAPHICS LAYERS
# ═══════════════════════════════════════════════════════════════════════

# ── Population Density (Province) ────────────────────────────────────
density_layer = folium.FeatureGroup(name="Population Density (Province)", show=False)

density_gj = json.loads(provinces_wgs.to_json())
for feat in density_gj["features"]:
    val = feat["properties"].get("pop_density")
    feat["properties"]["pop_density_round"] = round(val, 1) if val is not None else 0
    a = feat["properties"].get("area_km2")
    feat["properties"]["area_km2"] = round(a, 0) if a is not None else 0

def density_style(feature):
    d = feature["properties"].get("pop_density") or 0
    if d >= 200:   color = "#67000d"
    elif d >= 100: color = "#a50f15"
    elif d >= 50:  color = "#ef3b2c"
    elif d >= 20:  color = "#fc9272"
    elif d >= 10:  color = "#fcbba1"
    else:          color = "#fee5d9"
    return {"fillColor": color, "color": "#333", "weight": 1.5, "fillOpacity": 0.55}

folium.GeoJson(
    density_gj,
    style_function=density_style,
    tooltip=folium.GeoJsonTooltip(
        fields=["ADM2_NAME", "population", "pop_density_round", "area_km2"],
        aliases=["Province", "Population (2017)", "Density (ppl/km²)", "Area (km²)"],
        sticky=True,
    ),
).add_to(density_layer)
density_layer.add_to(m)

# ── Population Density Hexagons (Kontur) ─────────────────────────────
hex_layer = folium.FeatureGroup(name="Population Density Hexagons", show=False)

kontur_gj = json.loads(kontur_high.to_json())

def hex_style(feature):
    pop = feature["properties"].get("population", 0) or 0
    if pop >= 1000:  color, opacity = "#67000d", 0.7
    elif pop >= 500: color, opacity = "#a50f15", 0.6
    elif pop >= 200: color, opacity = "#ef3b2c", 0.5
    elif pop >= 100: color, opacity = "#fc9272", 0.4
    else:            color, opacity = "#fcbba1", 0.3
    return {"fillColor": color, "color": color, "weight": 0.3, "fillOpacity": opacity}

folium.GeoJson(
    kontur_gj,
    style_function=hex_style,
    tooltip=folium.GeoJsonTooltip(fields=["population"], aliases=["Population"], sticky=True),
).add_to(hex_layer)
hex_layer.add_to(m)

# ── Settlements (Clustered) ──────────────────────────────────────────
settlements_layer = folium.FeatureGroup(name="Settlements (OSM)", show=False)
cluster = MarkerCluster().add_to(settlements_layer)

type_colors = {"city": "red", "town": "blue", "village": "green", "hamlet": "gray", "isolated_dwelling": "lightgray"}

for feat in settlements_geojson["features"]:
    props = feat["properties"]
    coords = feat["geometry"]["coordinates"]
    name = props.get("name", "unnamed")
    ptype = props.get("place_type", "")
    pop = props.get("population", "")
    popup_text = f"<b>{name}</b><br>Type: {ptype}"
    if pop:
        popup_text += f"<br>Pop: {pop}"
    folium.CircleMarker(
        location=[coords[1], coords[0]],
        radius=4 if ptype in ("city", "town") else 2,
        color=type_colors.get(ptype, "gray"),
        fill=True, fillOpacity=0.7,
        popup=popup_text, tooltip=name,
    ).add_to(cluster)

settlements_layer.add_to(m)

# ═══════════════════════════════════════════════════════════════════════
# GEOGRAPHY LAYERS
# ═══════════════════════════════════════════════════════════════════════

# ── Province Boundaries ──────────────────────────────────────────────
province_boundary_layer = folium.FeatureGroup(name="Province Boundaries", show=False)

prov_outline_gj = json.loads(provinces_wgs.to_json())
folium.GeoJson(
    prov_outline_gj,
    style_function=lambda x: {
        "fillColor": "transparent", "color": "#333",
        "weight": 2, "fillOpacity": 0, "dashArray": "",
    },
    tooltip=folium.GeoJsonTooltip(
        fields=["ADM2_NAME"], aliases=["Province"], sticky=True,
    ),
).add_to(province_boundary_layer)
province_boundary_layer.add_to(m)

# ── Tikina Boundaries ────────────────────────────────────────────────
tikina_layer = folium.FeatureGroup(name="Tikina Boundaries", show=False)

tikina_gj = json.loads(tikinas_wgs.to_json())
for feat in tikina_gj["features"]:
    val = feat["properties"].get("pop_density")
    feat["properties"]["pop_density_round"] = round(val, 1) if val is not None else 0

folium.GeoJson(
    tikina_gj,
    style_function=lambda x: {
        "fillColor": "transparent", "color": "#555",
        "weight": 1, "dashArray": "4 2", "fillOpacity": 0,
    },
    tooltip=folium.GeoJsonTooltip(
        fields=["ADM3_NAME", "ADM2_NAME", "population", "pop_density_round"],
        aliases=["Tikina", "Province", "Population (2017)", "Density (ppl/km²)"],
        sticky=True,
    ),
).add_to(tikina_layer)
tikina_layer.add_to(m)

# ═══════════════════════════════════════════════════════════════════════
# GROUPED LAYER CONTROL
# ═══════════════════════════════════════════════════════════════════════
GroupedLayerControl(
    groups={
        "Energy": [elec_layer, shs_layer, fref_layer],
        "Demographics": [density_layer, hex_layer, settlements_layer],
        "Geography": [province_boundary_layer, tikina_layer],
    },
    exclusive_groups=[],
    collapsed=False,
).add_to(m)

# ── Legend ────────────────────────────────────────────────────────────
legend_html = """
<div style="
    position: fixed;
    bottom: 30px; left: 10px;
    background: white;
    padding: 12px 16px;
    border: 2px solid #ccc;
    border-radius: 8px;
    font-size: 12px;
    z-index: 9999;
    max-height: 420px;
    overflow-y: auto;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
">
<b>Fiji Energy & Demographics Map</b><br><br>

<b>Electricity Access</b><br>
<span style="display:inline-block;width:14px;height:14px;background:#2ecc71;border-radius:2px;vertical-align:middle"></span> &ge;90%<br>
<span style="display:inline-block;width:14px;height:14px;background:#f1c40f;border-radius:2px;vertical-align:middle"></span> 80-90%<br>
<span style="display:inline-block;width:14px;height:14px;background:#e67e22;border-radius:2px;vertical-align:middle"></span> 70-80%<br>
<span style="display:inline-block;width:14px;height:14px;background:#e74c3c;border-radius:2px;vertical-align:middle"></span> &lt;70%<br><br>

<b>SHS Installations</b><br>
<span style="display:inline-block;width:12px;height:12px;background:#8b0000;border-radius:50%;vertical-align:middle"></span> &le;2002 (~24y old)<br>
<span style="display:inline-block;width:12px;height:12px;background:#e67e22;border-radius:50%;vertical-align:middle"></span> 2003-2005 (~21y)<br>
<span style="display:inline-block;width:12px;height:12px;background:#3498db;border-radius:50%;vertical-align:middle"></span> Multi-year aggregate<br>
<span style="display:inline-block;width:12px;height:12px;background:#27ae60;border-radius:50%;vertical-align:middle"></span> Newer<br>
<span style="display:inline-block;width:12px;height:12px;background:#888;border-radius:50%;vertical-align:middle"></span> Unknown year<br>
<span style="font-size:10px">Large circles = regional aggregates</span><br><br>

<b>FREF Status</b><br>
<span style="color:#2980b9">&#9889;</span> Pilot (2017)<br>
<span style="color:#27ae60">&#9889;</span> Phase 1 (2025)<br>
<span style="color:#e67e22">&#9889;</span> Planned<br><br>

<b>Pop Density (ppl/km&sup2;)</b><br>
<span style="display:inline-block;width:14px;height:14px;background:#67000d;border-radius:2px;vertical-align:middle"></span> &ge;200<br>
<span style="display:inline-block;width:14px;height:14px;background:#a50f15;border-radius:2px;vertical-align:middle"></span> 100-200<br>
<span style="display:inline-block;width:14px;height:14px;background:#ef3b2c;border-radius:2px;vertical-align:middle"></span> 50-100<br>
<span style="display:inline-block;width:14px;height:14px;background:#fc9272;border-radius:2px;vertical-align:middle"></span> 20-50<br>
<span style="display:inline-block;width:14px;height:14px;background:#fee5d9;border-radius:2px;vertical-align:middle"></span> &lt;20<br><br>

<div style="font-size:10px;color:#666;border-top:1px solid #ddd;padding-top:6px">
Sources: HDX, Fiji BoS 2017 Census,<br>
Dept of Energy, FREF/UNDP, OSM, Kontur<br><br>
Note: Electricity % are estimates based<br>
on province urbanization level. SHS data<br>
is partial — 5,806 systems installed by 2015<br>
but village-level list is incomplete.
</div>
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

# ── Save ─────────────────────────────────────────────────────────────
output = f"{BASE}/fiji_energy_demographics_map.html"
m.save(output)
print(f"\nMap saved to: {output}")
print("Open in browser to view.")
