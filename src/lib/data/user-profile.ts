import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, created_at, social_login, black_reviews, black_users")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`사용자 정보를 불러오지 못했습니다: ${error.message}`);
  }

  return data ?? null;
}
