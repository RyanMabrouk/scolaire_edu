"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function getUserBooks() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    throw new Error("User not authenticated");
  }

  // Get books that user has access to through book copies
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
        description,
        isbn,
        publisher,
        edition,
        cover_image_url,
        price,
        is_published,
        created_at,
        updated_at,
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
    .eq("access_code_used_by", user.user.id)
    .eq("status", "assigned");

  if (error) {
    throw new Error(error.message);
  }

  const uniqueBooks = bookCopies?.flatMap((copy) => {
    const book = copy.book;
    if (book && book.is_published) {
      return {
        ...book,
        userCopy: {
          id: copy.id,
          access_code: copy.access_code,
          status: copy.status,
          used_at: copy.used_at,
        },
      };
    }
  });

  return { data: uniqueBooks, error: null };
}

const userBooksQuery = () => ({
  queryKey: ["userBooks"],
  queryFn: getUserBooks,
});

export default function useUserBooks() {
  return useQuery(userBooksQuery());
}

export { userBooksQuery };
