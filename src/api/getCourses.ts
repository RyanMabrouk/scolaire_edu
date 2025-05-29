"use server";
import { createClient } from "@/lib/supabase/server";

export default async function getCourses() {
  const supabase = createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: courses, error };
}
