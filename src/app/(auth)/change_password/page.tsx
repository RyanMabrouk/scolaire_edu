import getSession from "@/api/getSession";
import { redirect } from "next/navigation";
import React from "react";
import ChangePasswordForm from "./ChangePasswordForm/ChangePasswordForm";

export default async function Page() {
  const { session } = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Change your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Change Password Form */}
      <ChangePasswordForm />
    </div>
  );
}
