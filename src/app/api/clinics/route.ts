import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { data } = await getSupabaseAdmin()
    .from("clinics")
    .select("id, display_name, location_label, district, user_ratings_total")
    .eq("profile_status", "published")
    .in("review_status", ["directory_approved", "clinic_confirmed"])
    .order("user_ratings_total", { ascending: false })
    .limit(200);

  const clinics = (data ?? []).map((c) => ({
    id: String(c.id),
    name: c.display_name,
    location: (c.location_label ?? c.district ?? "Seoul") as string,
  }));
  return NextResponse.json({ clinics });
}
