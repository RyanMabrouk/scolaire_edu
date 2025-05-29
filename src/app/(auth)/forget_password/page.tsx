import getSession from "@/api/getSession";
import { redirect } from "next/navigation";
import React from "react";
import ForgotPasswordForm from "./ui/ForgotPasswordForm";

export default async function Page() {
  const { session } = await getSession();
  if (session) redirect("/home");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </div>

      {/* Forgot Password Form */}
      <ForgotPasswordForm />
    </div>
  );
}
