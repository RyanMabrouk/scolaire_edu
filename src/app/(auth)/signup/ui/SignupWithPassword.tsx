"use client";
import signUp from "@/actions/auth/signup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { z } from "zod";

export default function SignupWithPassword() {
  const queryClient = useQueryClient();
  const schema = z
    .object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirm: z.string(),
      policies: z.boolean().refine((val) => val, {
        message: "You must agree to the terms and policies",
      }),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Passwords must match",
      path: ["confirm"],
    });

  const [fieldErrors, setFieldErrors] = React.useState({
    email: "",
    password: "",
    confirm: "",
    policies: "",
  });
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const formObject = Object.fromEntries(formData) as {
        email: string;
        password: string;
        confirm: string;
        policies: string;
      };

      const policies = formObject.policies === "on";

      const data = {
        email: formObject.email,
        password: formObject.password,
        confirm: formObject.confirm,
        policies,
      };

      // Validate data with Zod
      try {
        schema.parse(data);
        setFieldErrors({
          email: "",
          password: "",
          confirm: "",
          policies: "",
        });
      } catch (err) {
        setSuccessMessage("");
        if (err instanceof z.ZodError) {
          const errors = {
            email: "",
            password: "",
            confirm: "",
            policies: "",
          };

          // Map each error to the corresponding field
          err.errors.forEach((e) => {
            errors[e.path[0] as keyof typeof errors] = e.message;
          });
          setFieldErrors(errors);
        } else {
          setFieldErrors({
            email: "",
            password: "",
            confirm: "",
            policies: "An unexpected error occurred",
          });
        }
        throw err;
      }

      // Proceed with signup if validation passes
      const { email, password } = data;
      const { error } = await signUp({ email, password });
      if (error?.message) {
        setFieldErrors({
          ...fieldErrors,
          email: error.message,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSuccessMessage(
        "Successfully signed up! Please check your email to verify your account.",
      );
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
            fieldErrors.email ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Enter your email"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
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
          autoComplete="new-password"
          required
          className={`w-full rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.password ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Create a password"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirm"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={`w-full rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.confirm ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Confirm your password"
        />
        {fieldErrors.confirm && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.confirm}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            id="policies"
            name="policies"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="policies" className="ml-2 text-sm text-gray-600">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-blue-600 underline hover:text-blue-500"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="text-blue-600 underline hover:text-blue-500"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        {fieldErrors.policies && (
          <p className="text-sm text-red-600">{fieldErrors.policies}</p>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-700">{successMessage}</p>
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
            Creating account...
          </div>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
