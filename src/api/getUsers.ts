"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function getUsers() {
  const supabase = createClient();
  const supabaseAdmin = createAdminClient();

  const { data: users, error: usersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    return { data: null, error: usersError.message };
  }

  const { data: bookCopies, error: copiesError } = await supabase
    .from("book_copies")
    .select(
      `
      access_code_used_by,
      book:books (
        course_books (
          course:courses (
            id
          )
        )
      )
    `,
    )
    .not("access_code_used_by", "is", null);

  if (copiesError) {
    return { data: null, error: copiesError.message };
  }
  const userProfiles = users.users.map((user) => {
    const userBookCopies =
      bookCopies?.filter((copy) => copy.access_code_used_by === user.id) || [];

    const uniqueCourses = new Set();
    userBookCopies.forEach((copy) => {
      copy.book?.course_books?.forEach((courseBook) => {
        if (courseBook.course?.id) {
          uniqueCourses.add(courseBook.course.id);
        }
      });
    });

    return {
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      disabled: user.user_metadata?.disabled || false,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      book_copies_count: userBookCopies.length,
      courses_count: uniqueCourses.size,
    };
  });

  return { data: userProfiles, error: null };
}
