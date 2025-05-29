"use server";
import { createClient } from "@/lib/supabase/server";

export default async function createChapter(chapterData: {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}) {
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
    .insert({
      course_id: chapterData.course_id,
      title: chapterData.title.trim(),
      description: chapterData.description?.trim() || null,
      order_index: chapterData.order_index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data: chapter, error };
}
