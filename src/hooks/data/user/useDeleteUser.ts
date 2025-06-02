"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import deleteUser from "@/api/deleteUser";

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Error deleting user", result.error);
      } else {
        toast.success("User deleted successfully!");
        // Invalidate user queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error: Error) => {
      toast.error("Error deleting user", error.message);
    },
  });
}
