import { createAuthSupabaseClient } from "@/lib/supabase/server-auth";

export async function getCurrentUser() {
  const supabase = await createAuthSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
