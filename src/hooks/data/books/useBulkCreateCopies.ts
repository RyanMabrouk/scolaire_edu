"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateBookCopies } from "@/api/books";
import { useToast } from "@/hooks/useToast";
import type { BulkCreateCopiesRequest } from "@/types/books";

export default function useBulkCreateCopies() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: BulkCreateCopiesRequest) =>
      bulkCreateBookCopies(request),
    onSuccess: (result, variables) => {
      if (result.data?.success) {
        toast.success(
          "Book copies created successfully!",
          `Successfully created ${variables.quantity} book copies`,
        );
        queryClient.invalidateQueries({ queryKey: ["book-copies"] });
        queryClient.invalidateQueries({ queryKey: ["books"] });
      } else {
        toast.error(
          "Failed to create book copies",
          result.data?.message || "Unknown error",
        );
      }
    },
    onError: (error) => {
      console.error("Error creating copies:", error);
      toast.error(
        "Failed to create book copies",
        error instanceof Error ? error.message : "Unknown error",
      );
    },
  });
}
