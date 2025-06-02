"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import signOut from "@/actions/auth/signout";
import { GraduationCap, Book, Copy, Users, LogOut } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    {
      name: "Courses",
      href: "/dashboard/courses",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      name: "Books",
      href: "/dashboard/books",
      icon: <Book className="h-5 w-5" />,
    },
    {
      name: "Book Copies",
      href: "/dashboard/book-copies",
      icon: <Copy className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <div className="fixed flex h-full w-64 flex-col bg-white shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span
                className={`mr-3 ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
