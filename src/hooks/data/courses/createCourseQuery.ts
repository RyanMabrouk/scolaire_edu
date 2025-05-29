import createCourse from "@/api/createCourse";

const createCourseQuery = (courseData: {
  title: string;
  description?: string;
  cover_image_url?: string;
  is_published?: boolean;
}) => ({
  mutationFn: async () => {
    return await createCourse(courseData);
  },
});

export { createCourseQuery };
