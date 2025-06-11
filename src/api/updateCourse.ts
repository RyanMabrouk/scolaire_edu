"use server";
import { createClient } from "@/lib/supabase/server";

export default async function updateCourse(
  courseId: string,
  courseData: {
    title?: string;
    description?: string;
    cover_image_url?: string;
    is_published?: boolean;
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

  const updateData: {
    title?: string;
    description?: string | null;
    cover_image_url?: string | null;
    is_published?: boolean;
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (courseData.title !== undefined) {
    updateData.title = courseData.title.trim();
  }
  if (courseData.description !== undefined) {
    updateData.description = courseData.description?.trim() || null;
  }
  if (courseData.cover_image_url !== undefined) {
    updateData.cover_image_url = courseData.cover_image_url?.trim() || null;
  }
  if (courseData.is_published !== undefined) {
    updateData.is_published = Boolean(courseData.is_published);
  }

  const { data: course, error } = await supabase
    .from("courses")
    .update(updateData)
    .eq("id", courseId)
    .select()
    .single();

  return { data: course, error };
}
