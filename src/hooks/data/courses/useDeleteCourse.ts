import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const deleteCourse = async (courseId: string) => {
  const supabase = createClient();

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
};

export default function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      // Invalidate and refetch courses queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["userCourses"] });
    },
  });
}
