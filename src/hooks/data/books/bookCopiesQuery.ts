import { getBookCopies } from "@/api/books";
import type { BookCopyFilters } from "@/types/books";

const bookCopiesQuery = (filters?: BookCopyFilters) =>
  ({
    queryKey: ["book-copies", filters],
    queryFn: async () => {
      return await getBookCopies(filters);
    },
  }) as const;

export { bookCopiesQuery };
