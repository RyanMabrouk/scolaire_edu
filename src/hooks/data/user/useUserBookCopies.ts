"use client";
import { useQuery } from "@tanstack/react-query";
import { userBookCopiesQueryOptions } from "./userBookCopiesQueryOptions";

export default function useUserBookCopies(userId: string) {
  return useQuery(userBookCopiesQueryOptions(userId));
}
