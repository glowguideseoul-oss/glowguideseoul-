import { getSupabaseAdmin } from "./supabase-server";

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  time: string;
  lang: string;
};

export type OpeningHours = {
  weekday_text: string[];
  open_now?: boolean;
};

export type ClinicForCard = {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
  rating: number | null;
  reviewCount: number | null;
  photoReferences: string[];
  source: string | null;
  firstReview: string | null;
};

export type ClinicForDetail = ClinicForCard & {
  foreignerSupport: string;
  beforeChecklist: string[];
  aftercareNotes: string;
  reviews: GoogleReview[];
  openingHours: OpeningHours | null;
  googleMapsUrl: string | null;
  phone: string | null;
  websiteUrl: string | null;
};

export async function getPublishedClinics(): Promise<ClinicForCard[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("clinics")
    .select(`
      id, display_name, location_label, district, description,
      price_range_label, sponsored_status, source,
      rating, user_ratings_total, photo_references, reviews,
      clinic_languages(language_label),
      clinic_categories(category)
    `)
    .eq("profile_status", "published")
    .in("review_status", ["directory_approved", "clinic_confirmed"])
    .order("sponsored_status", { ascending: false })
    .order("user_ratings_total", { ascending: false });

  if (error || !data) return [];

  return data.map((c) => ({
    id: String(c.id),
    name: c.display_name,
    location: (c.location_label as string | null) ?? (c.district as string | null) ?? "Seoul",
    description: (c.description as string | null) ?? "",
    priceRange: (c.price_range_label as string | null) ?? "Contact for pricing",
    sponsored: c.sponsored_status === "active",
    source: (c.source as string | null) ?? null,
    rating: (c.rating as number | null) ?? null,
    reviewCount: (c.user_ratings_total as number | null) ?? null,
    photoReferences: ((c.photo_references as string[] | null) ?? []),
    firstReview: ((c.reviews as GoogleReview[] | null)?.[0]?.text) ?? null,
    languages: ((c.clinic_languages as { language_label: string }[]) ?? []).map((l) => l.language_label),
    categories: ((c.clinic_categories as { category: string }[]) ?? []).map((cat) => cat.category),
  }));
}

export async function getClinicById(id: string): Promise<ClinicForDetail | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("clinics")
    .select(`
      id, display_name, location_label, district, description,
      price_range_label, sponsored_status, foreigner_support,
      before_visit_notes, aftercare_notes, source,
      rating, user_ratings_total, photo_references,
      reviews, opening_hours, kakao_place_url, phone, website_url,
      clinic_languages(language_label),
      clinic_categories(category),
      clinic_checklist_items(stage, label, sort_order)
    `)
    .eq("id", Number(id))
    .eq("profile_status", "published")
    .single();

  if (error || !data) return null;

  const beforeItems = ((data.clinic_checklist_items as { stage: string; label: string; sort_order: number }[]) ?? [])
    .filter((i) => i.stage === "before")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.label);

  const defaultChecklist = [
    "Bring your passport",
    "Confirm appointment time before visiting",
    "Prepare allergy and medication information",
  ];

  return {
    id: String(data.id),
    name: data.display_name,
    location: (data.location_label as string | null) ?? (data.district as string | null) ?? "Seoul",
    description: (data.description as string | null) ?? "",
    priceRange: (data.price_range_label as string | null) ?? "Contact for pricing",
    sponsored: data.sponsored_status === "active",
    source: (data.source as string | null) ?? null,
    rating: (data.rating as number | null) ?? null,
    reviewCount: (data.user_ratings_total as number | null) ?? null,
    photoReferences: ((data.photo_references as string[] | null) ?? []),
    languages: ((data.clinic_languages as { language_label: string }[]) ?? []).map((l) => l.language_label),
    categories: ((data.clinic_categories as { category: string }[]) ?? []).map((cat) => cat.category),
    foreignerSupport: (data.foreigner_support as string | null) ?? "Contact clinic for language support details.",
    beforeChecklist: beforeItems.length > 0 ? beforeItems : defaultChecklist,
    aftercareNotes: (data.aftercare_notes as string | null) ?? "Follow the clinic's aftercare instructions and contact them if symptoms feel unusual.",
    reviews: ((data.reviews as GoogleReview[] | null) ?? []),
    openingHours: (data.opening_hours as OpeningHours | null) ?? null,
    googleMapsUrl: (data.kakao_place_url as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    websiteUrl: (data.website_url as string | null) ?? null,
  };
}
