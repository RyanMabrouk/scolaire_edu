"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateChapter from "@/api/updateChapter";

export default function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chapterId,
      chapterData,
    }: {
      chapterId: string;
      chapterData: {
        title?: string;
        description?: string;
        order_index?: number;
      };
    }) => updateChapter(chapterId, chapterData),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
