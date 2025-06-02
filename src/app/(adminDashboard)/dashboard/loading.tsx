"use client";
import React from "react";
import { Loader2, GraduationCap } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            {/* Main loading spinner */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Loading text */}
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Loading Content
            </h2>
            <p className="text-gray-600">Fetching your dashboard data...</p>

            {/* Loading progress bar */}
            <div className="mx-auto mt-6 w-64">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full animate-pulse rounded-full bg-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
