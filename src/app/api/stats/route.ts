import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { count } = await getSupabaseAdmin()
    .from("appointment_requests")
    .select("id", { count: "exact", head: true });
  return NextResponse.json({ count: count ?? 0 });
}
