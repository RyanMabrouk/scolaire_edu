"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useUserBooks from "@/hooks/data/books/useUserBooks";
import { useToast } from "@/hooks/useToast";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Badge } from "@/components/shadcn-components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-components/card";

export default function BooksPage() {
  const router = useRouter();
  const { data: booksResponse, isLoading, error } = useUserBooks();
  const books = booksResponse?.data || [];
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading your books...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-red-600">
              Error loading books. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Your Books
              </h1>
              <p className="mt-1 text-gray-600">
                Access your digital textbooks and learning materials
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/home")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {books.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <CardTitle className="mb-2 text-lg">No books available</CardTitle>
              <p className="mb-4 text-gray-500">
                You haven't accessed any books yet. Use an access code to get
                started!
              </p>
              <Button onClick={() => router.push("/home")} variant="outline">
                Enter Access Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📖 Your Digital Library
                </h2>
                <p className="text-gray-600">
                  You have access to {books.length} book
                  {books.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book?.id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BookCard({ book }: { book: any }) {
  const { toast } = useToast();
  const associatedCourses = book.course_books || [];

  return (
    <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      {/* Book Cover */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
            <div className="text-center text-white">
              <svg
                className="mx-auto mb-2 h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-sm font-medium">Digital Book</p>
            </div>
          </div>
        )}

        {/* Access Status Badge */}
        <div className="absolute left-3 top-3">
          <Badge className="bg-green-100 text-green-800">
            <svg
              className="mr-1 h-3 w-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Owned
          </Badge>
        </div>

        {/* Access Code in corner */}
        {book.userCopy?.access_code && (
          <div className="absolute bottom-2 right-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(book.userCopy.access_code);
                toast.success("Access code copied to clipboard!");
              }}
              className="h-6 bg-white/90 px-2 text-xs backdrop-blur-sm"
            >
              <svg
                className="mr-1 h-2 w-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Code
            </Button>
          </div>
        )}
      </div>

      {/* Book Info */}
      <CardContent className="p-4">
        <CardTitle className="mb-2 line-clamp-2 text-lg font-semibold">
          {book.title}
        </CardTitle>

        {book.description && (
          <p className="mb-3 line-clamp-3 text-sm text-gray-600">
            {book.description}
          </p>
        )}

        {/* Book Details */}
        <div className="mb-3 space-y-1 text-xs text-gray-500">
          {book.publisher && (
            <div className="flex items-center">
              <span className="font-medium">Publisher:</span>
              <span className="ml-1">{book.publisher}</span>
            </div>
          )}
          {book.isbn && (
            <div className="flex items-center">
              <span className="font-medium">ISBN:</span>
              <span className="ml-1">{book.isbn}</span>
            </div>
          )}
          {book.edition && (
            <div className="flex items-center">
              <span className="font-medium">Edition:</span>
              <span className="ml-1">{book.edition}</span>
            </div>
          )}
        </div>

        {/* Associated Courses */}
        {associatedCourses.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-700">
              Related Courses:
            </p>
            <div className="flex flex-wrap gap-1">
              {associatedCourses.slice(0, 2).map((courseBook: any) => (
                <Link
                  key={courseBook.course.id}
                  href={`/courses/${courseBook.course.id}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-blue-50"
                  >
                    {courseBook.course.title}
                  </Badge>
                </Link>
              ))}
              {associatedCourses.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{associatedCourses.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Access Granted</span>
          </div>

          <div className="flex space-x-2">
            {/* View Related Courses */}
            {associatedCourses.length > 0 && (
              <Link href={`/courses/${associatedCourses[0].course.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  View Course
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
