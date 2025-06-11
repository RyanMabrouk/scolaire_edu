"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCreateCourse from "@/hooks/data/courses/useCreateCourse";
import useCreateChapter from "@/hooks/data/courses/useCreateChapter";
import useCreateLesson from "@/hooks/data/courses/useCreateLesson";
import VideoUpload from "@/components/admin/VideoUpload";
import { uploadFile } from "@/api/uploadFile";
import { useToast } from "@/hooks/useToast";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Input } from "@/components/shadcn-components/input";
import { Textarea } from "@/components/shadcn-components/textarea";
import { Checkbox } from "@/components/shadcn-components/checkbox";
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

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_type: "bmdrm_video" | "pdf";
  bmdrm_video_id?: string;
  pdf_url?: string;
  duration_minutes?: number;
  file?: File;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createCourseMutation = useCreateCourse();
  const createChapterMutation = useCreateChapter();
  const createLessonMutation = useCreateLesson();

  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    is_published: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCourseDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return null;

    try {
      const formData = new FormData();
      formData.append("coverImage", coverImageFile);

      const timestamp = Date.now();
      const filename = `course-cover-${timestamp}-${coverImageFile.name}`;

      const imageUrl = await uploadFile({
        formData,
        name: "coverImage",
        title: filename,
      });

      return imageUrl;
    } catch (error) {
      console.error("Failed to upload cover image:", error);
      return null;
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      lessons: [],
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (chapterId: string, field: string, value: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, [field]: value } : chapter,
      ),
    );
  };

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
  };

  const addLesson = (chapterId: string) => {
    const newLesson: Lesson = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      lesson_type: "bmdrm_video",
    };

    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
          : chapter,
      ),
    );
  };

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    field: string,
    value: any,
  ) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: chapter.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
              ),
            }
          : chapter,
      ),
    );
  };

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: chapter.lessons.filter(
                (lesson) => lesson.id !== lessonId,
              ),
            }
          : chapter,
      ),
    );
  };

  const handleVideoUploadComplete = (
    chapterId: string,
    lessonId: string,
    videoId: string,
  ) => {
    updateLesson(chapterId, lessonId, "bmdrm_video_id", videoId);
  };

  const handlePdfUpload = async (
    chapterId: string,
    lessonId: string,
    file: File,
  ) => {
    // Store the file locally for upload during course creation
    updateLesson(chapterId, lessonId, "file", file);
  };

  const handlePdfUploadToStorage = async (
    file: File,
    lessonTitle: string,
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("pdfFile", file);

      const timestamp = Date.now();
      const filename = `lesson-${timestamp}-${lessonTitle.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

      const pdfUrl = await uploadFile({
        formData,
        name: "pdfFile",
        title: filename,
      });

      return pdfUrl;
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      throw error;
    }
  };

  const createFullCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Upload cover image if provided
      let coverImageUrl = courseData.cover_image_url;
      if (coverImageFile) {
        const uploadedImageUrl = await uploadCoverImage();
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }

      // Step 2: Create the course
      const courseResult = await createCourseMutation.mutateAsync({
        ...courseData,
        cover_image_url: coverImageUrl,
      });

      if (courseResult.error || !courseResult.data) {
        throw new Error(
          typeof courseResult.error === "string"
            ? courseResult.error
            : "Failed to create course",
        );
      }

      const courseId = courseResult.data.id;

      // Step 3: Create chapters and lessons
      for (
        let chapterIndex = 0;
        chapterIndex < chapters.length;
        chapterIndex++
      ) {
        const chapter = chapters[chapterIndex];

        if (!chapter.title.trim()) continue;

        const chapterResult = await createChapterMutation.mutateAsync({
          course_id: courseId,
          title: chapter.title,
          description: chapter.description,
          order_index: chapterIndex,
        });

        if (chapterResult.error || !chapterResult.data) {
          throw new Error(
            typeof chapterResult.error === "string"
              ? chapterResult.error
              : "Failed to create chapter",
          );
        }

        const chapterId = chapterResult.data.id;

        // Step 4: Create lessons for this chapter
        for (
          let lessonIndex = 0;
          lessonIndex < chapter.lessons.length;
          lessonIndex++
        ) {
          const lesson = chapter.lessons[lessonIndex];

          if (!lesson.title.trim()) continue;

          let pdfUrl = null;

          // Upload PDF if it's a PDF lesson and has a file
          if (lesson.lesson_type === "pdf" && lesson.file) {
            try {
              pdfUrl = await handlePdfUploadToStorage(
                lesson.file,
                lesson.title,
              );
            } catch (error) {
              console.error("Failed to upload PDF:", error);
              // Continue without PDF URL
            }
          }

          await createLessonMutation.mutateAsync({
            chapter_id: chapterId,
            title: lesson.title,
            description: lesson.description,
            lesson_type: lesson.lesson_type,
            order_index: lessonIndex,
            bmdrm_video_id: lesson.bmdrm_video_id,
            pdf_url: pdfUrl || lesson.pdf_url,
            duration_minutes: lesson.duration_minutes,
          });
        }
      }

      // Success! Redirect to the course edit page
      router.push(`/dashboard/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(`Failed to create course: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !courseData.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
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
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            📚 Create New Course
          </h1>
          <p className="mt-1 text-gray-600">
            Build your complete course with chapters and lessons
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="text-sm font-medium text-gray-600">
                Course Info
              </div>
              <div className="h-px w-16 bg-gray-300"></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="text-sm font-medium text-gray-600">
                Course Content
              </div>
              <div className="h-px w-16 bg-gray-300"></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <div className="text-sm font-medium text-gray-600">Review</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          {currentStep === 1 && (
            <CardContent className="p-6">
              <CardTitle className="mb-6">Course Information</CardTitle>
              <div className="space-y-6">
                {/* Course Title */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Title *
                  </label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={courseData.title}
                    onChange={handleCourseDataChange}
                    placeholder="Enter course title"
                  />
                </div>

                {/* Course Description */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={courseData.description}
                    onChange={handleCourseDataChange}
                    placeholder="Enter course description"
                  />
                </div>

                {/* Cover Image */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cover_image_url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cover Image
                  </label>
                  <Input
                    type="file"
                    id="cover_image_url"
                    name="cover_image_url"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="mt-1"
                  />
                  {coverImagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Preview:</p>
                      <div className="mt-1 h-32 w-48 overflow-hidden rounded-lg border">
                        <Image
                          src={coverImagePreview}
                          alt="Course cover preview"
                          width={192}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Publish Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_published"
                    checked={courseData.is_published}
                    onCheckedChange={(checked: boolean) =>
                      setCourseData((prev) => ({
                        ...prev,
                        is_published: checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="is_published"
                    className="text-sm text-gray-700"
                  >
                    Publish course immediately
                  </label>
                </div>
              </div>
            </CardContent>
          )}

          {currentStep === 2 && (
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <CardTitle>Course Content</CardTitle>
                <Button onClick={addChapter}>Add Chapter</Button>
              </div>

              <div className="space-y-6">
                {chapters.map((chapter, chapterIndex) => (
                  <Card key={chapter.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Chapter {chapterIndex + 1}
                        </h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeChapter(chapter.id)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Chapter Title *
                          </label>
                          <Input
                            type="text"
                            value={chapter.title}
                            onChange={(e) =>
                              updateChapter(chapter.id, "title", e.target.value)
                            }
                            placeholder="Enter chapter title"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Chapter Description
                          </label>
                          <Input
                            type="text"
                            value={chapter.description}
                            onChange={(e) =>
                              updateChapter(
                                chapter.id,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Enter chapter description"
                          />
                        </div>
                      </div>

                      {/* Note: In creation mode, changes are saved locally and will be persisted when the course is created */}
                      <div className="mb-4 text-sm text-gray-500">
                        <p>
                          💡 Changes are saved locally and will be created when
                          you complete the course creation process.
                        </p>
                      </div>

                      {/* Lessons */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Lessons</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(chapter.id)}
                          >
                            Add Lesson
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <Card
                              key={lesson.id}
                              className="border-gray-100 bg-gray-50"
                            >
                              <CardContent className="p-3">
                                <div className="mb-3 flex items-center justify-between">
                                  <h5 className="font-medium text-gray-800">
                                    Lesson {lessonIndex + 1}
                                  </h5>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      removeLesson(chapter.id, lesson.id)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Lesson Title *
                                    </label>
                                    <Input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLesson(
                                          chapter.id,
                                          lesson.id,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Enter lesson title"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Lesson Type
                                    </label>
                                    <Select
                                      value={lesson.lesson_type}
                                      onValueChange={(value) =>
                                        updateLesson(
                                          chapter.id,
                                          lesson.id,
                                          "lesson_type",
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bmdrm_video">
                                          Video
                                        </SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Description
                                  </label>
                                  <Textarea
                                    rows={2}
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLesson(
                                        chapter.id,
                                        lesson.id,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter lesson description"
                                  />
                                </div>

                                {/* File Upload Section */}
                                <div className="mt-3">
                                  {lesson.lesson_type === "bmdrm_video" ? (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Video Upload
                                      </label>
                                      <div className="mt-1">
                                        <VideoUpload
                                          onUploadComplete={(result) =>
                                            handleVideoUploadComplete(
                                              chapter.id,
                                              lesson.id,
                                              result.uploadJobId,
                                            )
                                          }
                                          onUploadError={(error: string) => {
                                            console.error(
                                              "Video upload error:",
                                              error,
                                            );
                                            toast.error(
                                              `Video upload failed: ${error}`,
                                            );
                                          }}
                                          title={
                                            lesson.title || "Untitled Lesson"
                                          }
                                          description={lesson.description}
                                        />
                                      </div>
                                      {lesson.bmdrm_video_id && (
                                        <p className="mt-1 text-sm text-green-600">
                                          Video uploaded:{" "}
                                          {lesson.bmdrm_video_id}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        PDF Upload
                                      </label>
                                      <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handlePdfUpload(
                                              chapter.id,
                                              lesson.id,
                                              file,
                                            );
                                          }
                                        }}
                                        className="mt-1"
                                      />
                                      {lesson.file && (
                                        <p className="mt-1 text-sm text-green-600">
                                          PDF selected: {lesson.file.name}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {lesson.lesson_type === "bmdrm_video" && (
                                  <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Duration (minutes)
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={lesson.duration_minutes || ""}
                                      onChange={(e) =>
                                        updateLesson(
                                          chapter.id,
                                          lesson.id,
                                          "duration_minutes",
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="Enter duration in minutes"
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {chapters.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">
                      No chapters added yet. Click "Add Chapter" to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          )}

          {currentStep === 3 && (
            <CardContent className="p-6">
              <CardTitle className="mb-6">Review & Create</CardTitle>

              <div className="space-y-6">
                {/* Course Summary */}
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="mb-3 font-medium text-gray-900">
                      Course Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Title
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {courseData.title}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Status
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {courseData.is_published ? "Published" : "Draft"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Cover Image
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {coverImageFile
                            ? coverImageFile.name
                            : "No image selected"}
                        </dd>
                      </div>
                      {courseData.description && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            Description
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {courseData.description}
                          </dd>
                        </div>
                      )}
                    </dl>
                    {coverImagePreview && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-500">
                          Cover Image Preview:
                        </p>
                        <div className="h-32 w-48 overflow-hidden rounded-lg border">
                          <Image
                            src={coverImagePreview}
                            alt="Course cover preview"
                            width={192}
                            height={128}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chapters Summary */}
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="mb-3 font-medium text-gray-900">
                      Course Content ({chapters.length} chapters,{" "}
                      {chapters.reduce(
                        (total, chapter) => total + chapter.lessons.length,
                        0,
                      )}{" "}
                      lessons)
                    </h3>
                    <div className="space-y-3">
                      {chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="border-l-2 border-blue-200 pl-3"
                        >
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {chapter.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {chapter.lessons.length} lesson
                            {chapter.lessons.length !== 1 ? "s" : ""}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {chapter.lessons.map((lesson, lessonIndex) => (
                              <li
                                key={lesson.id}
                                className="text-sm text-gray-600"
                              >
                                {lessonIndex + 1}. {lesson.title} (
                                {lesson.lesson_type === "bmdrm_video"
                                  ? "Video"
                                  : "PDF"}
                                )
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}

          {/* Navigation */}
          <div className="flex justify-between border-t border-gray-200 px-6 py-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button onClick={createFullCourse} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Course"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
