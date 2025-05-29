import getUserCourseAccess from "@/api/getUserCourseAccess";

const userCourseAccessQuery = (courseId: string) => ({
  queryKey: ["userCourseAccess", courseId],
  queryFn: async () => {
    return await getUserCourseAccess(courseId);
  },
  enabled: !!courseId,
});

export { userCourseAccessQuery };
