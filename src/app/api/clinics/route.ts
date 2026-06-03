import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { data } = await getSupabaseAdmin()
    .from("clinics")
    .select("id, display_name")
    .eq("profile_status", "published")
    .in("review_status", ["directory_approved", "clinic_confirmed"])
    .order("display_name");

  const clinics = (data ?? []).map((c) => ({ id: String(c.id), name: c.display_name }));
  return NextResponse.json({ clinics });
}
