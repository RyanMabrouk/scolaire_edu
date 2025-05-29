import SignupForm from "./ui/SignupForm";
import getSession from "@/api/getSession";
import { redirect } from "next/navigation";

export default async function Page() {
  const { session } = await getSession();

  if (session) redirect("/home");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Start learning today
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Create your account and unlock access to premium courses
        </p>
      </div>

      {/* Signup Form */}
      <SignupForm />
    </div>
  );
}
