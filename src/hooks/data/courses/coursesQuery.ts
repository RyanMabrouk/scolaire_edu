import getCourses from "@/api/getCourses";

const coursesQuery = () => ({
  queryKey: ["courses"],
  queryFn: async () => {
    return await getCourses();
  },
});

export { coursesQuery };
