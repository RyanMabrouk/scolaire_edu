import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBook } from "@/api/books";
import { useToast } from "@/hooks/useToast";
import type { UpdateBookRequest } from "@/types/books";

export default function useUpdateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      bookId,
      bookData,
    }: {
      bookId: string;
      bookData: UpdateBookRequest;
    }) => updateBook(bookId, bookData),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(
          "Failed to update book",
          typeof result.error === "string"
            ? result.error
            : result.error.message,
        );
      } else {
        toast.success("Book updated successfully!", "Changes have been saved");
        // Invalidate and refetch books
        queryClient.invalidateQueries({ queryKey: ["books"] });
      }
    },
    onError: (error: any) => {
      toast.error(
        "Failed to update book",
        error.message || "An error occurred",
      );
    },
  });
}
