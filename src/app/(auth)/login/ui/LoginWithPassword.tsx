"use client";
import login from "@/actions/auth/login";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { z } from "zod";

export default function LoginWithPassword() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formObject: FormData) => {
      const data = Object.fromEntries(formObject) as {
        email: string;
        password: string;
      };

      try {
        loginSchema.parse(data);
        setErrors({});
      } catch (err) {
        setSuccessMessage("");
        if (err instanceof z.ZodError) {
          const errorObj: Record<string, string> = {};
          err.errors.forEach((e) => {
            if (e.path[0]) {
              errorObj[e.path[0] as string] = e.message;
            }
          });
          setErrors(errorObj);
        } else {
          setErrors({
            general: "An unexpected error occurred",
          });
        }
        throw err;
      }

      const email = formObject.get("email") as string;
      const password = formObject.get("password") as string;
      const { error } = await login({ email, password });

      if (error) {
        setErrors({ general: error.message });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSuccessMessage("Login successful");
    },
  });

  return (
    <form className="space-y-4" action={mutate}>
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`w-full rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`w-full rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.password ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link
          href="/forget_password"
          className="text-sm text-blue-600 transition-colors hover:text-blue-500"
        >
          Forgot your password?
        </Link>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {errors.general && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <div className="flex items-center">
            <svg
              className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing in...
          </div>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
