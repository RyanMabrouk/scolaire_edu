"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function getUserCourses() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    throw new Error("User not authenticated");
  }

  // Get courses that user has access to through book copies
  const { data: courses, error } = await supabase
    .from("book_copies")
    .select(
      `
      book:books (
        course_books (
          course:courses (
            id,
            title,
            description,
            cover_image_url,
            is_published,
            created_at,
            updated_at,
            chapters (
              id,
              title,
              description,
              order_index,
              lessons (
                id,
                title,
                description,
                lesson_type,
                order_index,
                bmdrm_video_id,
                pdf_url,
                duration_minutes
              )
            )
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

  const uniqueCourses = courses?.flatMap((copy) => {
    return copy.book?.course_books
      ?.map((courseBook) => {
        const course = courseBook.course;
        if (course && course.is_published) {
          return course;
        }
      })
      .filter((course) => course !== undefined);
  });

  return { data: uniqueCourses, error: null };
}

const userCoursesQuery = () => ({
  queryKey: ["userCourses"],
  queryFn: getUserCourses,
});

export default function useUserCourses() {
  return useQuery(userCoursesQuery());
}

export { userCoursesQuery };
