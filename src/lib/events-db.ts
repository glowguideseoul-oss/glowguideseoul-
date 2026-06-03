import { getSupabaseAdmin } from "./supabase-server";

export type ClinicEvent = {
  id: number;
  clinicId: number;
  clinicName: string;
  clinicLocation: string;
  clinicType: string;
  title: string;
  promoText: string | null;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

export async function getPublishedEvents(): Promise<ClinicEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("clinic_events")
    .select(`
      id, title, promo_text, description, image_url, start_date, end_date, status, clinic_id,
      clinics(display_name, location_label, district, clinic_type)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((e) => {
    const clinic = (Array.isArray(e.clinics) ? e.clinics[0] : e.clinics) as { display_name: string; location_label: string | null; district: string | null; clinic_type: string } | null;
    return {
      id: e.id,
      clinicId: e.clinic_id,
      clinicName: clinic?.display_name ?? "Unknown Clinic",
      clinicLocation: clinic?.location_label ?? clinic?.district ?? "Seoul",
      clinicType: clinic?.clinic_type ?? "dermatology",
      title: e.title,
      promoText: e.promo_text ?? null,
      description: e.description ?? null,
      imageUrl: e.image_url ?? null,
      startDate: e.start_date ?? null,
      endDate: e.end_date ?? null,
      status: e.status,
    };
  });
}

export async function getAllEventsAdmin() {
  const { data, error } = await getSupabaseAdmin()
    .from("clinic_events")
    .select(`
      id, title, promo_text, description, image_url, start_date, end_date, status, clinic_id, created_at,
      clinics(display_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublishedClinicsForEvents() {
  const { data } = await getSupabaseAdmin()
    .from("clinics")
    .select("id, display_name")
    .eq("profile_status", "published")
    .in("review_status", ["directory_approved", "clinic_confirmed"])
    .order("display_name");
  return data ?? [];
}
