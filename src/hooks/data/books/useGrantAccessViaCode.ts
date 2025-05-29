import { useMutation } from "@tanstack/react-query";
import { grantAccessViaCode } from "@/api/books";
import { useToast } from "@/hooks/useToast";
import type { GrantAccessRequest } from "@/types/books";

export default function useGrantAccessViaCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: GrantAccessRequest) => grantAccessViaCode(request),
    onSuccess: (result) => {
      if (result.error) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "An error occurred";
        toast.error("Access code test failed", errorMessage);
      } else if (result.data?.success) {
        toast.success(
          "Access code is valid!",
          `Grants access to ${result.data.courses_granted.length} courses`,
        );
      } else {
        toast.error("Access code is invalid", result.data?.message);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "An error occurred";
      toast.error("Failed to test access code", errorMessage);
    },
  });
}
