"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course, AccessCodeRedemptionResponse } from "@/types";
import useUserCourses from "@/hooks/data/courses/useUserCourses";
import useGrantAccessViaCode from "@/hooks/data/books/useGrantAccessViaCode";
import { useToast } from "@/hooks/useToast";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Input } from "@/components/shadcn-components/input";
import { Badge } from "@/components/shadcn-components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-components/dialog";

export default function HomePage() {
  const { data: coursesResponse, isLoading, error } = useUserCourses();
  const courses = coursesResponse?.data || [];
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading courses...</p>
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
              Error loading courses. Please try again.
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
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              📚 Welcome to Your Learning Dashboard
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Access your enrolled courses and continue your learning journey.
              Use access codes to unlock new content and expand your knowledge.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowAccessCodeModal(true)}
                size="lg"
                className="px-6 py-3"
              >
                Enter Access Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {courses.length === 0 ? (
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
              <CardTitle className="mb-2 text-lg">
                No courses available
              </CardTitle>
              <p className="mb-4 text-gray-500">
                You haven't enrolled in any courses yet. Use an access code to
                get started!
              </p>
              <Button
                onClick={() => setShowAccessCodeModal(true)}
                variant="outline"
              >
                Enter Access Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                📖 Your Courses
              </h2>
              <p className="text-gray-600">
                You have access to {courses.length} course
                {courses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Access Code Modal */}
      {showAccessCodeModal && (
        <AccessCodeModal onClose={() => setShowAccessCodeModal(false)} />
      )}
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const totalLessons = (course.chapters || []).reduce(
    (total: number, chapter: any) => total + (chapter.lessons || []).length,
    0,
  );

  return (
    <Link href={`/courses/${course.id}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        {/* Course Cover Image */}
        <div className="relative aspect-video overflow-hidden">
          {course.cover_image_url ? (
            <Image
              src={course.cover_image_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="text-center text-white">
                <svg
                  className="mx-auto mb-2 h-12 w-12"
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
                <p className="text-sm font-medium">Course</p>
              </div>
            </div>
          )}

          {/* Access Granted Badge */}
          <div className="absolute right-3 top-3">
            <Badge className="bg-green-100 text-green-800">✓ Enrolled</Badge>
          </div>
        </div>

        {/* Course Info */}
        <CardContent className="p-4">
          <CardTitle className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600">
            {course.title}
          </CardTitle>

          {course.description && (
            <p className="mb-3 line-clamp-3 text-sm text-gray-600">
              {course.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>{(course.chapters || []).length} chapters</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>{totalLessons} lessons</span>
              </div>
            </div>

            <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Continue →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AccessCodeModal({ onClose }: { onClose: () => void }) {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const grantAccessMutation = useGrantAccessViaCode();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }

    setIsLoading(true);
    try {
      await grantAccessMutation.mutateAsync({
        unique_code: accessCode.trim(),
      });

      // Close modal and refresh page to show new courses
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Access code error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>📝 Enter Access Code</DialogTitle>
          <DialogDescription>
            Enter your book access code to unlock new courses and learning
            materials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="accessCode"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Access Code
            </label>
            <Input
              id="accessCode"
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !accessCode.trim()}>
              {isLoading ? "Verifying..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
