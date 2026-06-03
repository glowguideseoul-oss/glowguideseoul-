import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  await getSupabase().from("page_views").insert({ country_code: country });
  return NextResponse.json({ ok: true });
}
