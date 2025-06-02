import getUsers from "@/api/getUsers";

export const usersQueryOptions = () => ({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await getUsers();
    return response;
  },
});
