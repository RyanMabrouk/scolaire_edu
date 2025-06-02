"use server";

import { createClient } from "@/lib/supabase/server";

export default async function getUserBookCopies(userId: string) {
  const supabase = createClient();

  const { data: bookCopies, error } = await supabase
    .from("book_copies")
    .select(
      `
      id,
      access_code,
      status,
      used_at,
      book:books (
        id,
        title,
        isbn,
        publisher,
        cover_image_url,
        course_books (
          course:courses (
            id,
            title,
            is_published
          )
        )
      )
    `,
    )
    .eq("access_code_used_by", userId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: bookCopies, error: null };
}
