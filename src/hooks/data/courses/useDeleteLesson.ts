"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteLesson from "@/api/deleteLesson";

export default function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
