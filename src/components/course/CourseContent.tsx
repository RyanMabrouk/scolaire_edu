"use client";

import React, { useState } from "react";
import { LessonWithAttachments } from "@/types";
import BMDRMVideoPlayer from "@/components/player/BMDRMVideoPlayer";
import PDFViewer from "@/components/player/PDFViewer";
import { useCourse } from "@/hooks/data/courses";

interface CourseContentProps {
  course?: NonNullable<ReturnType<typeof useCourse>["data"]>["data"];
  userAccess: {
    hasAccess: boolean;
    accessType?: "code" | "assigned";
    expiresAt?: string;
  };
}

export default function CourseContent({
  course,
  userAccess,
}: CourseContentProps) {
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithAttachments | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleLessonSelect = (lesson: LessonWithAttachments) => {
    if (userAccess.hasAccess) {
      setSelectedLesson(lesson);
    }
  };

  const handleProgressUpdate = (progress: number) => {
    // Progress is automatically tracked in the video player component
    console.log("Lesson progress:", progress);
  };

  const handleLessonComplete = () => {
    console.log("Lesson completed");
    // Could trigger confetti or other completion effects
  };

  if (!userAccess.hasAccess) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Access Required
        </h3>
        <p className="mb-6 text-gray-600">
          You need to purchase or be assigned access to this course to view the
          lessons.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Content Area */}
      {selectedLesson ? (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedLesson.title}
                </h2>
                {selectedLesson.description && (
                  <p className="mt-1 text-gray-600">
                    {selectedLesson.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedLesson.lesson_type === "bmdrm_video" &&
            selectedLesson.bmdrm_video_id ? (
              <BMDRMVideoPlayer
                videoId={selectedLesson.bmdrm_video_id}
                lessonId={selectedLesson.id}
                title={selectedLesson.title}
                onProgressUpdate={handleProgressUpdate}
                onComplete={handleLessonComplete}
                className="w-full"
              />
            ) : selectedLesson.lesson_type === "pdf" &&
              selectedLesson.pdf_url ? (
              <PDFViewer
                pdfUrl={selectedLesson.pdf_url}
                title={selectedLesson.title}
                className="w-full"
              />
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">Content not available</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Select a Lesson
          </h3>
          <p className="text-gray-600">
            Choose a lesson from the chapters below to start learning.
          </p>
        </div>
      )}

      {/* Chapter and Lesson Navigation */}
      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Course Lessons
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {course?.chapters?.map((chapter, chapterIndex) => (
            <div key={chapter.id}>
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {chapter.lessons.length} lesson
                      {chapter.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedChapters.has(chapter.id) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {expandedChapters.has(chapter.id) && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full border-l-4 p-4 text-left transition-colors hover:bg-gray-100 ${
                        selectedLesson?.id === lesson.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.lesson_type === "bmdrm_video" ? (
                            <svg
                              className="h-5 w-5 text-blue-500"
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
                          ) : (
                            <svg
                              className="h-5 w-5 text-red-500"
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
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="truncate text-sm text-gray-600">
                              {lesson.description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center space-x-4">
                            <span className="text-xs capitalize text-gray-500">
                              {lesson.lesson_type.replace("_", " ")}
                            </span>
                            {lesson.duration_minutes &&
                              lesson.duration_minutes > 0 && (
                                <span className="text-xs text-gray-500">
                                  {lesson.duration_minutes} min
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
