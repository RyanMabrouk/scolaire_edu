"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteChapter from "@/api/deleteChapter";

export default function useDeleteChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
