import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;

  if (!password || authCookie !== password) {
    redirect("/admin/login");
  }
}
