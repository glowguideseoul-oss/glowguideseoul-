import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error } = await getSupabaseAdmin()
    .from("clinic_listing_inquiries")
    .insert(body);

  if (error) {
    console.error("clinic-listing insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
