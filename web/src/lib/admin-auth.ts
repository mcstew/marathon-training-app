import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-emails";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function hasAdminProfileRole(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdminUser(redirectTo = "/admin"): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const allowedByEmail = isAdminEmail(user.email);
  const allowedByRole = await hasAdminProfileRole(user.id);

  if (!allowedByEmail && !allowedByRole) {
    redirect("/");
  }

  return user;
}
