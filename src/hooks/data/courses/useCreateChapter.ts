"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createChapter from "@/api/createChapter";

export default function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterData: {
      course_id: string;
      title: string;
      description?: string;
      order_index: number;
    }) => {
      return await createChapter(chapterData);
    },
    onSuccess: (data, variables) => {
      // Invalidate course query to refetch the course with new chapter
      queryClient.invalidateQueries({
        queryKey: ["course", variables.course_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["singleCourse", variables.course_id],
      });
    },
  });
}
