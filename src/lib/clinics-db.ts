import { getSupabase } from "./supabase";

export type ClinicForCard = {
  id: string;
  name: string;
  location: string;
  categories: string[];
  languages: string[];
  priceRange: string;
  sponsored: boolean;
  description: string;
};

export type ClinicForDetail = ClinicForCard & {
  foreignerSupport: string;
  beforeChecklist: string[];
  aftercareNotes: string;
};

export async function getPublishedClinics(): Promise<ClinicForCard[]> {
  const { data, error } = await getSupabase()
    .from("clinics")
    .select(`
      id, display_name, location_label, district, description,
      price_range_label, sponsored_status,
      clinic_languages(language_label),
      clinic_categories(category)
    `)
    .order("sponsored_status", { ascending: false })
    .order("display_name");

  if (error || !data) return [];

  return data.map((c) => ({
    id: String(c.id),
    name: c.display_name,
    location: (c.location_label as string | null) ?? (c.district as string | null) ?? "Seoul",
    description: (c.description as string | null) ?? "",
    priceRange: (c.price_range_label as string | null) ?? "Contact for pricing",
    sponsored: c.sponsored_status === "active",
    languages: ((c.clinic_languages as { language_label: string }[]) ?? []).map((l) => l.language_label),
    categories: ((c.clinic_categories as { category: string }[]) ?? []).map((cat) => cat.category),
  }));
}

export async function getClinicById(id: string): Promise<ClinicForDetail | null> {
  const { data, error } = await getSupabase()
    .from("clinics")
    .select(`
      id, display_name, location_label, district, description,
      price_range_label, sponsored_status, foreigner_support,
      before_visit_notes, aftercare_notes,
      clinic_languages(language_label),
      clinic_categories(category),
      clinic_checklist_items(stage, label, sort_order)
    `)
    .eq("id", Number(id))
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
    languages: ((data.clinic_languages as { language_label: string }[]) ?? []).map((l) => l.language_label),
    categories: ((data.clinic_categories as { category: string }[]) ?? []).map((cat) => cat.category),
    foreignerSupport: (data.foreigner_support as string | null) ?? "Contact clinic for language support details.",
    beforeChecklist: beforeItems.length > 0 ? beforeItems : defaultChecklist,
    aftercareNotes: (data.aftercare_notes as string | null) ?? "Follow the clinic's aftercare instructions and contact them if symptoms feel unusual.",
  };
}
