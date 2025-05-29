"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createCourse from "@/api/createCourse";

export default function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: {
      title: string;
      description?: string;
      cover_image_url?: string;
      is_published?: boolean;
    }) => {
      return await createCourse(courseData);
    },
    onSuccess: () => {
      // Invalidate courses query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
