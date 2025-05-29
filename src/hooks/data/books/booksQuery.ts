import { getBooks } from "@/api/books";
import type { BookFilters } from "@/types/books";

const booksQuery = (filters?: BookFilters) => ({
  queryKey: ["books", filters],
  queryFn: async () => {
    return await getBooks(filters);
  },
});

export { booksQuery };
