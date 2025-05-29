"use server";
import { createClient } from "@/lib/supabase/server";

export default async function getUserCourseAccess(courseId: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user has access through book copies
  const { data: bookCopies, error } = await supabase
    .from("book_copies")
    .select(
      `
      *,
      book:books (
        course_books!inner (
          course_id
        )
      )
    `,
    )
    .eq("access_code_used_by", user.user.id)
    .eq("status", "assigned")
    .eq("book.course_books.course_id", courseId);

  if (error) {
    return { data: null, error };
  }

  const hasAccess = bookCopies && bookCopies.length > 0;

  // Return in the same format as before for compatibility
  return {
    data: hasAccess
      ? { user_id: user.user.id, course_id: courseId, has_access: true }
      : null,
    error: null,
  };
}
