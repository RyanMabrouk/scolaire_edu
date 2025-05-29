"use client";
import { useQuery } from "@tanstack/react-query";
import { booksQuery } from "./booksQuery";
import type { BookFilters } from "@/types/books";

export default function useBooks(filters?: BookFilters) {
  const query = useQuery(booksQuery(filters));
  return query;
}
