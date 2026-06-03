"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Action = "publish" | "draft" | "reject" | "prospect";

export async function updateClinicStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const action = String(formData.get("action")) as Action;

  if (!id || !["publish", "draft", "reject", "prospect"].includes(action)) {
    return;
  }

  const supabase = getSupabaseAdmin();

  if (action === "publish") {
    await supabase
      .from("clinics")
      .update({
        profile_status: "published",
        review_status: "directory_approved",
      })
      .eq("id", id);
  }

  if (action === "draft") {
    await supabase
      .from("clinics")
      .update({
        profile_status: "draft",
        review_status: "directory_approved",
      })
      .eq("id", id);
  }

  if (action === "reject") {
    await supabase
      .from("clinics")
      .update({
        profile_status: "archived",
        review_status: "rejected",
        sponsored_status: "none",
      })
      .eq("id", id);
  }

  if (action === "prospect") {
    await supabase
      .from("clinics")
      .update({
        sponsored_status: "prospect",
      })
      .eq("id", id);
  }

  revalidatePath("/admin/clinics");
}
