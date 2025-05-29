"use server";
import { createClient } from "@/lib/supabase/server";

export default async function getCourseWithContent(courseId: string) {
  const supabase = createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      chapters (
        *,
        lessons (*)
      ),
      course_books (
        *,
        books (*)
      )
    `,
    )
    .eq("id", courseId)
    .single();

  return {
    data: {
      ...course,
      books: course?.course_books.map((book) => book.books) || [],
    },
    error,
  };
}
