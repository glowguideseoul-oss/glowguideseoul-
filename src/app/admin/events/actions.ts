"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  await supabase.from("clinic_events").insert({
    clinic_id: Number(formData.get("clinic_id")),
    title: formData.get("title") as string,
    promo_text: (formData.get("promo_text") as string) || null,
    description: (formData.get("description") as string) || null,
    image_url: (formData.get("image_url") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    status: "draft",
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function updateEventStatus(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const id = Number(formData.get("id"));
  const action = formData.get("action") as string;

  const status = action === "publish" ? "published" : "draft";
  await supabase.from("clinic_events").update({ status }).eq("id", id);

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const id = Number(formData.get("id"));

  await supabase.from("clinic_events").delete().eq("id", id);

  revalidatePath("/admin/events");
  revalidatePath("/events");
}
