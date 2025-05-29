"use client";

import React, { useState } from "react";

export default function BookDemoPage() {
  const [accessCode, setAccessCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsRedeeming(true);
    setMessage("");

    try {
      const response = await fetch("/api/courses/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: accessCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Success! You now have access to "${result.course_title}"`);
        setMessageType("success");
        setAccessCode("");
      } else {
        setMessage(result.message);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred while redeeming the code");
      setMessageType("error");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          📚 Book Access Code System
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Each physical book comes with a unique access code that unlocks the
          corresponding digital course. Each code can only be used once.
        </p>
      </div>

      {/* How it Works */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          How it Works
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="mb-2 font-medium text-gray-900">
              1. Buy Physical Book
            </h3>
            <p className="text-sm text-gray-600">
              Purchase a physical book from the admin in real life
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="mb-2 font-medium text-gray-900">
              2. Find Access Code
            </h3>
            <p className="text-sm text-gray-600">
              Each book contains a unique 8-character access code
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="mb-2 font-medium text-gray-900">3. Unlock Course</h3>
            <p className="text-sm text-gray-600">
              Enter the code below to access your digital course
            </p>
          </div>
        </div>
      </div>

      {/* Access Code Form */}
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">
            Enter Your Book Access Code
          </h2>

          <form onSubmit={handleRedeemCode} className="space-y-4">
            <div>
              <label
                htmlFor="accessCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Access Code
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-center font-mono text-lg tracking-wider placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRedeeming}
              />
              <p className="mt-1 text-xs text-gray-500">Example: ABC12345</p>
            </div>

            {message && (
              <div
                className={`rounded-md p-3 ${
                  messageType === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <p className="text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isRedeeming || !accessCode.trim()}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRedeeming ? (
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
                  Redeeming...
                </div>
              ) : (
                "Unlock Course"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">🔒 One-Time Use</h3>
          <p className="text-gray-600">
            Each access code can only be used once. Once redeemed, the code
            becomes invalid and cannot be used by anyone else.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">
            📱 Instant Access
          </h3>
          <p className="text-gray-600">
            Once you enter a valid code, you immediately get access to the full
            course including videos, PDFs, and all learning materials.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">
            🎯 Course Specific
          </h3>
          <p className="text-gray-600">
            Each book is linked to a specific course. The access code will only
            unlock the course that corresponds to your book.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">
            ♾️ Lifetime Access
          </h3>
          <p className="text-gray-600">
            Once unlocked, you have permanent access to your course. You can
            learn at your own pace without any time restrictions.
          </p>
        </div>
      </div>
    </div>
  );
}
