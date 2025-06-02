import getUserBookCopies from "@/api/getUserBookCopies";

export const userBookCopiesQueryOptions = (userId: string) => ({
  queryKey: ["user-book-copies", userId],
  queryFn: () => getUserBookCopies(userId),
  enabled: !!userId,
});
