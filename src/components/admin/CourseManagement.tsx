"use client";

import React, { useState } from "react";
import { Course } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import useCourses from "@/hooks/data/courses/useCourses";
import useUpdateCourse from "@/hooks/data/courses/useUpdateCourse";
import useDeleteCourse from "@/hooks/data/courses/useDeleteCourse";
import useGenerateAccessCode from "@/hooks/data/courses/useGenerateAccessCode";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-components/select";

export default function CourseManagement() {
  const { data: coursesResponse, isLoading, error } = useCourses();
  const courses = coursesResponse?.data || [];
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const generateAccessCodeMutation = useGenerateAccessCode();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "title">("created_at");
  const { toast } = useToast();

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.is_published) ||
        (statusFilter === "draft" && !course.is_published);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created_at":
        default:
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
      }
    });

  const togglePublishStatus = async (courseId: string) => {
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      const result = await updateCourseMutation.mutateAsync({
        courseId,
        courseData: {
          is_published: !course.is_published,
        },
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update course status",
        );
      }

      toast.success(
        `Course ${!course.is_published ? "published" : "unpublished"} successfully!`,
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error(`Failed to update course status: ${error}`);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const result = await deleteCourseMutation.mutateAsync(courseId);

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to delete course",
        );
      }

      toast.success("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(`Failed to delete course: ${error}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-red-600">
              Error loading courses. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Filters and Search */}
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "published" | "draft")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "created_at" | "title")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {/* Course List */}
      <CardContent>
        <div className="divide-y divide-gray-200">
          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No courses found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating a new course."}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  {/* Course Image */}
                  <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                    {course.cover_image_url ? (
                      <Image
                        src={course.cover_image_url}
                        alt={course.title}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <svg
                          className="h-8 w-8 text-white"
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="truncate text-lg font-medium text-gray-900">
                        {course.title}
                      </h3>
                      <Badge
                        variant={course.is_published ? "default" : "secondary"}
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>

                    {course.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Created {formatDate(course.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span>Updated {formatDate(course.updated_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/courses/${course.id}`}>Edit</Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(course.id)}
                      disabled={
                        updateCourseMutation.isPending &&
                        updateCourseMutation.variables?.courseId === course.id
                      }
                    >
                      {updateCourseMutation.isPending &&
                      updateCourseMutation.variables?.courseId === course.id
                        ? "Updating..."
                        : course.is_published
                          ? "Unpublish"
                          : "Publish"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCourse(course.id)}
                      disabled={
                        deleteCourseMutation.isPending &&
                        deleteCourseMutation.variables === course.id
                      }
                    >
                      {deleteCourseMutation.isPending &&
                      deleteCourseMutation.variables === course.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
