"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignCourseToBook } from "@/api/books";
import type { CourseBookInsert } from "@/types/books";
import { useToast } from "@/hooks/useToast";

interface AssignBooksToCourseRequest {
  courseId: string;
  bookIds: string[];
}

export default function useAssignBooksToCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ courseId, bookIds }: AssignBooksToCourseRequest) => {
      const results = [];

      for (const bookId of bookIds) {
        const request: CourseBookInsert = {
          course_id: courseId,
          book_id: bookId,
        };

        const result = await assignCourseToBook(request);
        results.push(result);

        if (result.error) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : "An error occurred",
          );
        }
      }

      return results;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch course data
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });

      // Invalidate books list
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });

      toast.success(
        "Books assigned successfully!",
        `${variables.bookIds.length} book(s) have been assigned to the course.`,
      );
    },
  });
}
