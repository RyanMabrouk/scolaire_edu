"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateLesson from "@/api/updateLesson";

export default function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      lessonData,
    }: {
      lessonId: string;
      lessonData: {
        title?: string;
        description?: string;
        lesson_type?: "bmdrm_video" | "pdf";
        order_index?: number;
        bmdrm_video_id?: string;
        pdf_url?: string;
        duration_minutes?: number;
      };
    }) => updateLesson(lessonId, lessonData),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
