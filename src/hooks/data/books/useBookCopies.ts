"use client";
import { useQuery } from "@tanstack/react-query";
import { bookCopiesQuery } from "./bookCopiesQuery";
import type { BookCopyFilters } from "@/types/books";

export default function useBookCopies(filters?: BookCopyFilters) {
  return useQuery(bookCopiesQuery(filters));
}
