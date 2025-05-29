import getCourse from "@/api/getCourse";

const singleCourseQuery = (courseId: string) => ({
  queryKey: ["singleCourse", courseId],
  queryFn: async () => {
    return await getCourse(courseId);
  },
});

export { singleCourseQuery };
