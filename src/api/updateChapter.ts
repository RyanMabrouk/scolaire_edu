"use server";
import { createClient } from "@/lib/supabase/server";

export default async function updateChapter(
  chapterId: string,
  chapterData: {
    title?: string;
    description?: string;
    order_index?: number;
  },
) {
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

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (chapterData.title !== undefined) {
    updateData.title = chapterData.title.trim();
  }
  if (chapterData.description !== undefined) {
    updateData.description = chapterData.description?.trim() || null;
  }
  if (chapterData.order_index !== undefined) {
    updateData.order_index = chapterData.order_index;
  }

  const { data: chapter, error } = await supabase
    .from("chapters")
    .update(updateData)
    .eq("id", chapterId)
    .select()
    .single();

  return { data: chapter, error };
}
