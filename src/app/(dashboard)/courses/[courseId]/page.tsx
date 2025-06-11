"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CourseWithChapters } from "@/types";
import CourseContent from "@/components/course/CourseContent";
import useCourse from "@/hooks/data/courses/useCourse";
import useUserCourseAccess from "@/hooks/data/courses/useUserCourseAccess";
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

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data: courseResponse,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(params.courseId);
  const { data: accessResponse, isLoading: accessLoading } =
    useUserCourseAccess(params.courseId);

  const course = courseResponse?.data;
  const accessRecord = accessResponse?.data;

  // Convert access record to UserAccessInfo format
  const userAccess = accessRecord
    ? {
        hasAccess: accessRecord.has_access || false,
        accessType: "code" as "code" | "assigned", // Default to code since we're using book access codes
        expiresAt: undefined, // No expiration in the new system
      }
    : { hasAccess: false };

  if (courseLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading course...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Course Not Found
            </h1>
            <p className="mb-4 text-gray-600">
              The course you're looking for doesn't exist or is not available.
            </p>
            <Button variant="outline" onClick={() => router.push("/home")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/home")}
            className="mb-4"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Button>

          <div className="flex items-start space-x-6">
            {/* Course Cover */}
            <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
              {course.cover_image_url ? (
                <Image
                  src={course.cover_image_url}
                  alt={course.title || "Course"}
                  width={96}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                📚 {course.title}
              </h1>
              {course.description && (
                <p className="mb-4 text-lg text-gray-600">
                  {course.description}
                </p>
              )}

              <div className="flex items-center space-x-4">
                {userAccess.hasAccess ? (
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
                    Access Granted
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Access Required
                  </Badge>
                )}

                <span className="text-sm text-gray-500">
                  {(course.chapters || []).length} chapters •{" "}
                  {(course.chapters || []).reduce(
                    (total, chapter) => total + chapter.lessons.length,
                    0,
                  )}{" "}
                  lessons
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Left Panel - Course Overview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CourseOverview course={course} userAccess={userAccess} />
            </div>
          </div>

          {/* Right Panel - Course Content */}
          <div className="lg:col-span-2">
            <CourseContent course={course} userAccess={userAccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseOverview({
  course,
  userAccess,
}: {
  course?: NonNullable<ReturnType<typeof useCourse>["data"]>["data"];
  userAccess: {
    hasAccess: boolean;
    accessType?: "code" | "assigned";
    expiresAt?: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const totalLessons = (course?.chapters || []).reduce(
    (total: number, chapter) => total + chapter.lessons.length,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Course Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Chapters:</span>
            <span className="font-semibold text-gray-900">
              {(course?.chapters || []).length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Lessons:</span>
            <span className="font-semibold text-gray-900">{totalLessons}</span>
          </div>
        </div>

        {/* Access Status */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            {userAccess.hasAccess ? (
              <>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium text-green-700">
                  Access Granted
                </span>
              </>
            ) : (
              <>
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="font-medium text-red-700">
                  Access Required
                </span>
              </>
            )}
          </div>

          {userAccess.hasAccess && userAccess.accessType && (
            <p className="mt-1 text-sm capitalize text-gray-600">
              {userAccess.accessType} access
              {userAccess.expiresAt && (
                <span>
                  {" "}
                  • Expires{" "}
                  {new Date(userAccess.expiresAt).toLocaleDateString()}
                </span>
              )}
            </p>
          )}

          {!userAccess.hasAccess && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-gray-600">
                You need an access code to view this course content.
              </p>
              <Button onClick={() => router.push("/home")} className="w-full">
                Enter Access Code
              </Button>
            </div>
          )}
        </div>

        {/* Chapter List */}
        <div className="border-t pt-4">
          <h3 className="mb-3 font-semibold text-gray-900">Course Content</h3>
          <div className="space-y-2">
            {(course?.chapters || []).map((chapter, index) => (
              <Card key={chapter.id} className="border-gray-200">
                <CardContent className="p-3">
                  <h4 className="font-medium text-gray-900">
                    {index + 1}. {chapter.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {chapter.lessons.length} lesson
                    {chapter.lessons.length !== 1 ? "s" : ""}
                  </p>

                  {/* Show lesson types for accessible courses */}
                  {userAccess.hasAccess && chapter.lessons && (
                    <div className="mt-2 space-y-1">
                      {chapter.lessons.map((lesson, lessonIndex: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center text-xs text-gray-600"
                        >
                          {lesson.lesson_type === "pdf" ? (
                            <svg
                              className="mr-1 h-3 w-3 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          ) : lesson.lesson_type === "video" ? (
                            <svg
                              className="mr-1 h-3 w-3 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v5a2 2 0 002 2h2a2 2 0 002-2v-5"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="mr-1 h-3 w-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                          <span>{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
