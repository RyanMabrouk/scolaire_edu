"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import generateAccessCode from "@/api/generateAccessCode";

export default function useGenerateAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => generateAccessCode(courseId),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
