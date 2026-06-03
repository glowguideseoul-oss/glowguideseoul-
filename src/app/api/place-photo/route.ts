import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const w = req.nextUrl.searchParams.get("w") ?? "800";
  if (!ref) return new NextResponse("Missing ref", { status: 400 });

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return new NextResponse("No API key", { status: 500 });

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${ref}&key=${key}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return new NextResponse("Photo not found", { status: 404 });

  const blob = await res.arrayBuffer();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
