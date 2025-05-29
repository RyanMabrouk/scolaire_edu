"use server";
import { createClient } from "@/lib/supabase/server";

export default async function createLesson(lessonData: {
  chapter_id: string;
  title: string;
  description?: string;
  lesson_type: "bmdrm_video" | "pdf";
  order_index: number;
  bmdrm_video_id?: string;
  pdf_url?: string;
  duration_minutes?: number;
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

  // Provide appropriate default values based on lesson type to satisfy constraint
  const insertData = {
    chapter_id: lessonData.chapter_id,
    title: lessonData.title.trim(),
    description: lessonData.description?.trim() || null,
    lesson_type: lessonData.lesson_type,
    order_index: lessonData.order_index,
    duration_minutes: lessonData.duration_minutes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Provide appropriate defaults based on lesson type
    bmdrm_video_id:
      lessonData.lesson_type === "bmdrm_video"
        ? lessonData.bmdrm_video_id || "placeholder"
        : null,
    pdf_url:
      lessonData.lesson_type === "pdf"
        ? lessonData.pdf_url || "placeholder"
        : null,
  };

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert(insertData)
    .select()
    .single();

  return { data: lesson, error };
}
