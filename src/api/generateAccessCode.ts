"use server";
import { createClient } from "@/lib/supabase/server";

export default async function generateAccessCode(courseId: string) {
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

  // Generate a random access code (8 characters, alphanumeric)
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  let accessCode = generateCode();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure the code is unique
  while (attempts < maxAttempts) {
    const { data: existingCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("access_code", accessCode)
      .single();

    if (!existingCourse) {
      break; // Code is unique
    }

    accessCode = generateCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { data: null, error: "Failed to generate unique access code" };
  }

  // Update the course with the new access code
  const { data: course, error } = await supabase
    .from("courses")
    .update({
      access_code: accessCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { access_code: accessCode, course }, error: null };
}
