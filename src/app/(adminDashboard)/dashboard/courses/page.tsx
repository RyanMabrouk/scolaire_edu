"use client";
import React from "react";
import Link from "next/link";
import CourseManagement from "@/components/admin/CourseManagement";
import useCourses from "@/hooks/data/courses/useCourses";
import { BookOpen, CheckCircle, AlertTriangle, Key } from "lucide-react";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-components/card";

export default function AdminCoursesPage() {
  const { data: coursesResponse, isLoading, error } = useCourses();
  const courses = coursesResponse?.data || [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Course Management
              </h1>
              <p className="mt-1 text-gray-600">
                Create and manage your eLearning courses
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/courses/new">Create New Course</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {!isLoading && !error && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Courses
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-green-100 p-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter((c) => c.is_published).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter((c) => !c.is_published).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      With Access Code
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter((c) => (c as any).access_code).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Management Component */}
        <CourseManagement />
      </div>
    </div>
  );
}
