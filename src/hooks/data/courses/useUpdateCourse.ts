"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateCourse from "@/api/updateCourse";

export default function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      courseData,
    }: {
      courseId: string;
      courseData: {
        title?: string;
        description?: string;
        cover_image_url?: string;
        is_published?: boolean;
      };
    }) => updateCourse(courseId, courseData),
    onSuccess: () => {
      // Invalidate and refetch courses data
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}
