import React from "react";
import Link from "next/link";
import { Button } from "@/components/shadcn-components/button";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          {/* Educational Icon */}
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-16 w-16 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              📚 Page Not Found
            </h1>
            <p className="mb-4 text-lg text-gray-600">
              Looks like this learning path doesn't exist yet!
            </p>
            <div className="mx-auto mb-6 h-1 w-16 rounded bg-blue-600"></div>
            <p className="text-gray-500">
              The page you're looking for might have been moved, deleted, or
              doesn't exist. Let's get you back to your learning journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/home">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-gray-400">
            <p>Error Code: 404</p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-100 opacity-20"></div>
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-100 opacity-20"></div>
      </div>
    </div>
  );
}

export default NotFound;
