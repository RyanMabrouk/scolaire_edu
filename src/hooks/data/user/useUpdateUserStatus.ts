"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import updateUserStatus from "@/api/updateUserStatus";

export default function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      updateUserStatus(userId, disabled),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error("Error updating user status", result.error);
      } else {
        const action = variables.disabled ? "disabled" : "enabled";
        toast.success(`User ${action} successfully!`);
        // Invalidate user queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error: Error) => {
      toast.error("Error updating user status", error.message);
    },
  });
}
