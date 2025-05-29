"use client";
import Link from "next/link";
import LoginWithPassword from "./LoginWithPassword";
import LoginWithGoogle from "./LoginWithGoogle";

export default function LoginForm() {
  return (
    <div className="space-y-6">
      {/* Login Form */}
      <LoginWithPassword />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          {/* <span className="bg-white px-2 text-gray-500">Or continue with</span> */}
        </div>
      </div>

      {/* <LoginWithGoogle /> */}

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
