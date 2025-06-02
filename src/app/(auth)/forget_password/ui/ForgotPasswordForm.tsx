"use client";
import resetPassword from "@/actions/auth/resetPassword";
import Input from "@/components/Input";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import useTranslation from "@/translation/useTranslation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { z } from "zod";

export default function ForgotPasswordForm() {
  const { data: translation } = useTranslation();
  const [errors, setErrors] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const forgotPasswordSchema = z.object({
    email: z
      .string({
        message: translation?.lang["{ELEMENT} must be a string"].replace(
          "{ELEMENT}",
          "Email",
        ),
      })
      .email(
        translation?.lang["Invalid email address"] ?? "Invalid email address",
      ),
  });
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = formData.get("email") as string;

      try {
        forgotPasswordSchema.parse({ email });
        setErrors([]);
      } catch (err) {
        setSuccessMessage("");
        if (err instanceof z.ZodError) {
          setErrors(err.errors.map((e) => e.message));
        } else {
          setErrors([
            translation?.lang["An unexpected error occurred"] ??
              "An unexpected error occurred",
          ]);
        }
        throw err;
      }

      const { error } = await resetPassword({ email });
      if (error) {
        setErrors([error.message]);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setSuccessMessage(
        translation?.lang[
          "A password reset link has been sent to your email."
        ] ?? "",
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Reset Password Form */}
      <form action={mutate} className="space-y-6">
        <div className="space-y-2">
          <Input
            label={translation?.lang["email"] ?? "Email"}
            type="email"
            required
            name="email"
          />

          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>
          )}

          {successMessage && (
            <p className="text-sm text-green-500">{successMessage}</p>
          )}
        </div>

        <PrimaryButton loading={isPending} className="w-full">
          {translation?.lang["Send Reset Link"] ?? "Send Reset Link"}
        </PrimaryButton>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            {translation?.lang["or"] ?? "or"}
          </span>
        </div>
      </div>

      {/* Back to Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500"
          >
            Return to login
          </Link>
        </p>
      </div>
    </div>
  );
}
