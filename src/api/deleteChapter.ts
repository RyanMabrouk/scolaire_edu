"use server";
import { createClient } from "@/lib/supabase/server";

export default async function deleteChapter(chapterId: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data: chapter, error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId)
    .select()
    .single();

  return { data: chapter, error };
}
