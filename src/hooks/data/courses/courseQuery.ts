import getCourseWithContent from "@/api/getCourseWithContent";

const courseQuery = (courseId: string) => ({
  queryKey: ["course", courseId],
  queryFn: async () => {
    return await getCourseWithContent(courseId);
  },
  enabled: !!courseId,
});

export { courseQuery };
