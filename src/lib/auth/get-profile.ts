import { getCurrentUser } from "@/lib/auth/get-session";
import { createAuthSupabaseClient } from "@/lib/supabase/server-auth";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  email_alerts_enabled: boolean;
};

export async function getCurrentProfile(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  profile: UserProfile;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createAuthSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, email_alerts_enabled")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? {
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      email_alerts_enabled: true,
    },
  };
}

export async function getUserIdOrNull() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
