"use client";
import React from "react";
import { Loader2, BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          {/* Main loading spinner */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Loading text */}
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Loading Dashboard
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your admin panel...
          </p>

          {/* Loading dots animation */}
          <div className="mt-4 flex justify-center space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
