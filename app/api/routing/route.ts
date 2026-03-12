import { NextRequest, NextResponse } from "next/server";

// OSRM public demo server (for development; deploy your own for production)
const OSRM_URL =
  process.env.OSRM_URL || "https://router.project-osrm.org/route/v1/driving";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination } = body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return NextResponse.json(
        { error: "Missing origin or destination coordinates" },
        { status: 400 }
      );
    }

    const url = `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!res.ok) {
      return NextResponse.json(
        { error: "OSRM routing failed" },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: "No route found between the two points" },
        { status: 404 }
      );
    }

    const route = data.routes[0];

    return NextResponse.json({
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      geometry: route.geometry,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Routing service unavailable" },
      { status: 503 }
    );
  }
}
