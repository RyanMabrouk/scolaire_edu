import getSession from "@/api/getSession";
import LoginForm from "@/app/(auth)/login/ui/LoginForm";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
  const { session } = await getSession();
  if (session) redirect("/home");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to continue your learning journey
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
