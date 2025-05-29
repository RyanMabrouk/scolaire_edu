"use client";
import { useQuery } from "@tanstack/react-query";

// Define the query function inline since we don't have a separate API function
const getBook = async (bookId: string) => {
  // We'll use the getBook API function that was referenced in the search results
  const { getBook: getBookApi } = await import("@/api/books");
  return await getBookApi(bookId);
};

const bookQuery = (bookId: string) => ({
  queryKey: ["book", bookId],
  queryFn: async () => {
    return await getBook(bookId);
  },
  enabled: !!bookId,
});

export default function useBook(bookId: string) {
  const query = useQuery(bookQuery(bookId));
  return query;
}

export { bookQuery };
