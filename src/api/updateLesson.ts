"use server";
import { createClient } from "@/lib/supabase/server";

export default async function updateLesson(
  lessonId: string,
  lessonData: {
    title?: string;
    description?: string;
    lesson_type?: "bmdrm_video" | "pdf";
    order_index?: number;
    bmdrm_video_id?: string;
    pdf_url?: string;
    duration_minutes?: number;
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

  if (lessonData.title !== undefined) {
    updateData.title = lessonData.title.trim();
  }
  if (lessonData.description !== undefined) {
    updateData.description = lessonData.description?.trim() || null;
  }
  if (lessonData.lesson_type !== undefined) {
    updateData.lesson_type = lessonData.lesson_type;
  }
  if (lessonData.order_index !== undefined) {
    updateData.order_index = lessonData.order_index;
  }
  if (lessonData.bmdrm_video_id !== undefined) {
    updateData.bmdrm_video_id = lessonData.bmdrm_video_id?.trim() || null;
  }
  if (lessonData.pdf_url !== undefined) {
    updateData.pdf_url = lessonData.pdf_url?.trim() || null;
  }
  if (lessonData.duration_minutes !== undefined) {
    updateData.duration_minutes = lessonData.duration_minutes;
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .update(updateData)
    .eq("id", lessonId)
    .select()
    .single();

  return { data: lesson, error };
}
