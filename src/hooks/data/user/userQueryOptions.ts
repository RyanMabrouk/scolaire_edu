import getUser from "@/api/getUser";

export const userQueryOptions = () => ({
  queryKey: ["user"],
  queryFn: getUser,
});
