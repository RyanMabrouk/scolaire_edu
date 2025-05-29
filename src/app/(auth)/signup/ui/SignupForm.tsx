"use client";
import React from "react";
import Link from "next/link";
import SignupWithPassword from "./SignupWithPassword";
import SignupWithGoogle from "./SignupWithGoogle";

export default function SignupForm() {
  return (
    <div className="space-y-6">
      {/* Signup Form */}
      <SignupWithPassword />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          {/* <span className="bg-white px-2 text-gray-500">Or continue with</span> */}
        </div>
      </div>

      {/* Google Signup */}
      {/* <SignupWithGoogle /> */}

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
