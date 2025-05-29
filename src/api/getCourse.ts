"use server";
import { createClient } from "@/lib/supabase/server";

export default async function getCourse(courseId: string) {
  const supabase = createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  return { data: course, error };
}
