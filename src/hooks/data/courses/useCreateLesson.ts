"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createLesson from "@/api/createLesson";

export default function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: {
      chapter_id: string;
      title: string;
      description?: string;
      lesson_type: "bmdrm_video" | "pdf";
      order_index: number;
      bmdrm_video_id?: string;
      pdf_url?: string;
      duration_minutes?: number;
    }) => {
      return await createLesson(lessonData);
    },
    onSuccess: (data, variables) => {
      // Invalidate course queries to refetch the course with new lesson
      queryClient.invalidateQueries({ queryKey: ["course"] });
      queryClient.invalidateQueries({ queryKey: ["singleCourse"] });
    },
  });
}
