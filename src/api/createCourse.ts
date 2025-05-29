"use server";
import { createClient } from "@/lib/supabase/server";

export default async function createCourse(courseData: {
  title: string;
  description?: string;
  cover_image_url?: string;
  is_published?: boolean;
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

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title: courseData.title.trim(),
      description: courseData.description?.trim() || null,
      cover_image_url: courseData.cover_image_url?.trim() || null,
      is_published: Boolean(courseData.is_published),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data: course, error };
}
