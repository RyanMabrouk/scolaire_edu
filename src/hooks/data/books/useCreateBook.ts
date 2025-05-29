"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook } from "@/api/books";
import { useToast } from "@/hooks/useToast";
import type { CreateBookRequest } from "@/types/books";

export default function useCreateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (bookData: CreateBookRequest) => createBook(bookData),
    onSuccess: (result) => {
      if (result.data) {
        toast.success(
          "Book created successfully!",
          `"${result.data.title}" has been added to your catalog`,
        );
        queryClient.invalidateQueries({ queryKey: ["books"] });
      } else {
        toast.error(
          "Failed to create book",
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error",
        );
      }
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      toast.error(
        "Failed to create book",
        error instanceof Error ? error.message : "Unknown error",
      );
    },
  });
}
