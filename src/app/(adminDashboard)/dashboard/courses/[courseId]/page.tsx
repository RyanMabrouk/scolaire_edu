"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import useSingleCourse from "@/hooks/data/courses/useSingleCourse";
import useUpdateCourse from "@/hooks/data/courses/useUpdateCourse";
import useGenerateAccessCode from "@/hooks/data/courses/useGenerateAccessCode";
import useCreateChapter from "@/hooks/data/courses/useCreateChapter";
import useCreateLesson from "@/hooks/data/courses/useCreateLesson";
import useUpdateChapter from "@/hooks/data/courses/useUpdateChapter";
import useUpdateLesson from "@/hooks/data/courses/useUpdateLesson";
import useDeleteChapter from "@/hooks/data/courses/useDeleteChapter";
import useDeleteLesson from "@/hooks/data/courses/useDeleteLesson";
import VideoUpload from "@/components/admin/VideoUpload";
import { uploadFile } from "@/api/uploadFile";
import useCourse from "@/hooks/data/courses/useCourse";
import { useToast } from "@/hooks/useToast";
import useBooks from "@/hooks/data/books/useBooks";
import useAssignBooksToCourse from "@/hooks/data/books/useAssignBooksToCourse";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Plus,
  AlertTriangle,
  Search,
  Edit,
  Trash2,
} from "lucide-react";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Input } from "@/components/shadcn-components/input";
import { Textarea } from "@/components/shadcn-components/textarea";
import { Checkbox } from "@/components/shadcn-components/checkbox";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-components/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-components/dialog";

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_type: "bmdrm_video" | "pdf";
  order_index: number;
  bmdrm_video_id?: string;
  pdf_url?: string;
  duration_minutes?: number;
  file?: File;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();

  const { data: courseResponse, isLoading, error } = useCourse(courseId);
  const updateCourseMutation = useUpdateCourse();
  const generateAccessCodeMutation = useGenerateAccessCode();
  const createChapterMutation = useCreateChapter();
  const createLessonMutation = useCreateLesson();
  const updateChapterMutation = useUpdateChapter();
  const updateLessonMutation = useUpdateLesson();
  const deleteChapterMutation = useDeleteChapter();
  const deleteLessonMutation = useDeleteLesson();
  const assignBooksMutation = useAssignBooksToCourse();

  const course = courseResponse?.data;

  const [activeTab, setActiveTab] = useState("course");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    is_published: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isAssignBooksOpen, setIsAssignBooksOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bookSearchTerm, setBookSearchTerm] = useState("");

  // Fetch real books data
  const {
    data: booksResponse,
    isLoading: isBooksLoading,
    error: booksError,
  } = useBooks();
  const availableBooks = booksResponse?.data || [];

  const filteredAvailableBooks = availableBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      (book.publisher &&
        book.publisher.toLowerCase().includes(bookSearchTerm.toLowerCase())) ||
      (book.isbn && book.isbn.includes(bookSearchTerm)),
  );

  const handleBookSelection = (bookId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedBooks([...selectedBooks, bookId]);
    } else {
      setSelectedBooks(selectedBooks.filter((id) => id !== bookId));
    }
  };

  const handleAssignBooks = async () => {
    try {
      await assignBooksMutation.mutateAsync({
        courseId,
        bookIds: selectedBooks,
      });

      // Reset modal state
      setSelectedBooks([]);
      setBookSearchTerm("");
      setIsAssignBooksOpen(false);
    } catch (error) {
      console.error("Error assigning books:", error);
      toast.error("Failed to assign books", "Please try again.");
    }
  };

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        cover_image_url: course.cover_image_url || "",
        is_published: course.is_published || false,
      });
      // Set preview to existing cover image if available
      if (course.cover_image_url) {
        setCoverImagePreview(course.cover_image_url);
      }
      // Set chapters data
      if (course.chapters) {
        setChapters(
          course.chapters.map((chapter: any) => ({
            id: chapter.id,
            title: chapter.title || "",
            description: chapter.description || "",
            order_index: chapter.order_index || 0,
            lessons:
              chapter.lessons?.map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title || "",
                description: lesson.description || "",
                lesson_type:
                  (lesson.lesson_type as "bmdrm_video" | "pdf") ||
                  "bmdrm_video",
                order_index: lesson.order_index || 0,
                bmdrm_video_id: lesson.bmdrm_video_id || "",
                pdf_url: lesson.pdf_url || "",
                duration_minutes: lesson.duration_minutes || 0,
              })) || [],
          })),
        );
      }
    }
  }, [course]);

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

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Upload new cover image if provided
      let coverImageUrl = formData.cover_image_url;
      if (coverImageFile) {
        const uploadedImageUrl = await uploadCoverImage();
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }

      const result = await updateCourseMutation.mutateAsync({
        courseId,
        courseData: {
          ...formData,
          cover_image_url: coverImageUrl,
        },
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update course",
        );
      }

      toast.success("Course updated successfully!");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(`Failed to update course: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateNewAccessCode = async () => {
    try {
      const result = await generateAccessCodeMutation.mutateAsync(courseId);

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to generate access code",
        );
      }

      if (result.data?.access_code) {
        toast.success(`New access code generated: ${result.data.access_code}`);
      } else {
        throw new Error("No access code returned");
      }
    } catch (error) {
      console.error("Error generating access code:", error);
      toast.error(`Failed to generate access code: ${error}`);
    }
  };

  // Chapter management functions
  const addNewChapter = async () => {
    try {
      const result = await createChapterMutation.mutateAsync({
        course_id: courseId,
        title: "New Chapter",
        description: "",
        order_index: chapters.length,
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create chapter",
        );
      }

      toast.success("Chapter created successfully!");
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error(`Failed to create chapter: ${error}`);
    }
  };

  const updateChapter = async (
    chapterId: string,
    field: string,
    value: any,
  ) => {
    // Update local state immediately for UI responsiveness
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, [field]: value } : chapter,
      ),
    );
  };

  const saveChapter = async (chapterId: string) => {
    try {
      const chapter = chapters.find((c) => c.id === chapterId);
      if (!chapter) return;

      const result = await updateChapterMutation.mutateAsync({
        chapterId,
        chapterData: {
          title: chapter.title,
          description: chapter.description,
        },
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update chapter",
        );
      }

      toast.success("Chapter saved successfully!");
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast.error(`Failed to save chapter: ${error}`);
    }
  };

  const removeChapter = async (chapterId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chapter? This will also delete all lessons in this chapter.",
      )
    ) {
      return;
    }

    try {
      const result = await deleteChapterMutation.mutateAsync(chapterId);

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to delete chapter",
        );
      }

      toast.success("Chapter deleted successfully!");
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error(`Failed to delete chapter: ${error}`);
    }
  };

  // Lesson management functions
  const addNewLesson = async (chapterId: string) => {
    try {
      const chapter = chapters.find((c) => c.id === chapterId);
      if (!chapter) return;

      const result = await createLessonMutation.mutateAsync({
        chapter_id: chapterId,
        title: "New Lesson",
        description: "",
        lesson_type: "bmdrm_video",
        order_index: chapter.lessons.length,
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to create lesson",
        );
      }

      toast.success("Lesson created successfully!");
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error(`Failed to create lesson: ${error}`);
    }
  };

  const updateLesson = async (lessonId: string, field: string, value: any) => {
    // Update local state immediately for UI responsiveness
    setChapters(
      chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
        ),
      })),
    );
  };

  const saveLesson = async (lessonId: string) => {
    try {
      const lesson = chapters
        .flatMap((c) => c.lessons)
        .find((l) => l.id === lessonId);
      if (!lesson) return;

      const result = await updateLessonMutation.mutateAsync({
        lessonId,
        lessonData: {
          title: lesson.title,
          description: lesson.description,
          lesson_type: lesson.lesson_type,
          bmdrm_video_id: lesson.bmdrm_video_id,
          pdf_url: lesson.pdf_url,
          duration_minutes: lesson.duration_minutes,
        },
      });

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update lesson",
        );
      }

      toast.success("Lesson saved successfully!");
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error(`Failed to save lesson: ${error}`);
    }
  };

  const removeLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      const result = await deleteLessonMutation.mutateAsync(lessonId);

      if (result.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Failed to delete lesson",
        );
      }

      toast.success("Lesson deleted successfully!");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error(`Failed to delete lesson: ${error}`);
    }
  };

  const handleVideoUploadComplete = async (
    lessonId: string,
    videoId: string,
  ) => {
    updateLesson(lessonId, "bmdrm_video_id", videoId);
    toast.success("Video uploaded successfully! Remember to save the lesson.");
  };

  const handlePdfUpload = async (
    lessonId: string,
    file: File,
    lessonTitle: string,
  ) => {
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

      updateLesson(lessonId, "pdf_url", pdfUrl);
      toast.success("PDF uploaded successfully! Remember to save the lesson.");
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      toast.error(`Failed to upload PDF: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading course...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-red-600">
              Error loading course. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">📚 Edit Course</h1>
          <p className="mt-1 text-gray-600">
            Update course information, chapters, and lessons
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="course">Course Info</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <Card className="mt-6">
            <TabsContent value="course" className="m-0">
              <CardContent className="p-6">
                <CardTitle className="mb-6">Course Information</CardTitle>
                <form onSubmit={handleCourseSubmit} className="space-y-6">
                  {/* Course Title */}
                  <div>
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
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter course title"
                    />
                  </div>

                  {/* Course Description */}
                  <div>
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
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter course description"
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
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
                    />
                    {coverImageFile && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected: {coverImageFile.name}
                      </p>
                    )}
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
                      checked={formData.is_published}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_published: checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="is_published"
                      className="text-sm text-gray-700"
                    >
                      Course is published
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdating || !formData.title.trim()}
                    >
                      {isUpdating ? "Updating..." : "Update Course"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="content" className="m-0">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <CardTitle>Course Content</CardTitle>
                  <Button onClick={addNewChapter}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Chapter
                  </Button>
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
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Chapter
                          </Button>
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Chapter Title *
                            </label>
                            <Input
                              type="text"
                              value={chapter.title}
                              onChange={(e) =>
                                updateChapter(
                                  chapter.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter chapter title"
                            />
                          </div>
                          <div>
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

                        {/* Chapter Save Button */}
                        <div className="mb-4 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => saveChapter(chapter.id)}
                          >
                            Save Chapter
                          </Button>
                        </div>

                        {/* Lessons */}
                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Lessons
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewLesson(chapter.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
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
                                      onClick={() => removeLesson(lesson.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Lesson Title *
                                      </label>
                                      <Input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) =>
                                          updateLesson(
                                            lesson.id,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Enter lesson title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">
                                        Lesson Type
                                      </label>
                                      <Select
                                        value={lesson.lesson_type}
                                        onValueChange={(value) =>
                                          updateLesson(
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
                                          <SelectItem value="pdf">
                                            PDF
                                          </SelectItem>
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
                                            onUploadComplete={(
                                              videoId: string,
                                            ) =>
                                              handleVideoUploadComplete(
                                                lesson.id,
                                                videoId,
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
                                                lesson.id,
                                                file,
                                                lesson.title,
                                              );
                                            }
                                          }}
                                        />
                                        {lesson.pdf_url && (
                                          <p className="mt-1 text-sm text-green-600">
                                            PDF uploaded:{" "}
                                            {lesson.pdf_url.split("/").pop()}
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
                                            lesson.id,
                                            "duration_minutes",
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                        placeholder="Enter duration in minutes"
                                      />
                                    </div>
                                  )}

                                  {/* Lesson Save Button */}
                                  <div className="mt-4 flex justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => saveLesson(lesson.id)}
                                    >
                                      Save Lesson
                                    </Button>
                                  </div>
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
                        No chapters added yet. Click "Add Chapter" to get
                        started.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <CardContent className="p-6">
                <CardTitle className="mb-6">Course Settings</CardTitle>

                <div className="space-y-6">
                  {/* Course Books */}
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">
                        📚 Course Books
                      </h3>

                      {/* Books List */}
                      <div className="space-y-3">
                        {course.books && course.books.length > 0 ? (
                          course.books.map((book: any, index: number) => (
                            <div
                              key={book.id || index}
                              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                  {book.cover_image_url ? (
                                    <Image
                                      src={book.cover_image_url}
                                      alt={book.title}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <BookOpen className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {book.title}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    by {book.publisher || "Unknown Publisher"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    ISBN: {book.isbn || "N/A"}
                                  </p>
                                  {book.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                      {book.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    book.is_published ? "default" : "secondary"
                                  }
                                >
                                  {book.is_published ? "Published" : "Draft"}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    router.push(`/dashboard/books/${book.id}`);
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No books assigned
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              This course doesn't have any books assigned yet.
                            </p>
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAssignBooksOpen(true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Assign Books
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add Book Actions */}
                      {course.books && course.books.length > 0 && (
                        <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAssignBooksOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add More Books
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Books
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Course Stats */}
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">
                        📊 Course Information
                      </h3>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Created
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {course.created_at
                              ? new Date(course.created_at).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Last Updated
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {course.updated_at
                              ? new Date(course.updated_at).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Status
                          </dt>
                          <dd className="text-sm text-gray-900">
                            <Badge
                              variant={
                                course.is_published ? "default" : "secondary"
                              }
                            >
                              {course.is_published ? "Published" : "Draft"}
                            </Badge>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Chapters
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {chapters.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Total Lessons
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {chapters.reduce(
                              (total, chapter) =>
                                total + chapter.lessons.length,
                              0,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Total Books
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {course.books ? course.books.length : 0}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>

        {/* Assign Books Modal */}
        <Dialog open={isAssignBooksOpen} onOpenChange={setIsAssignBooksOpen}>
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
            <DialogHeader>
              <DialogTitle>📚 Assign Books to Course</DialogTitle>
              <DialogDescription>
                Select books to assign to "{course.title}". You can search by
                title, author, or ISBN.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={bookSearchTerm}
                  onChange={(e) => setBookSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Selected Books Summary */}
              {selectedBooks.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedBooks.length} book(s) selected
                  </p>
                </div>
              )}

              {/* Books List */}
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {isBooksLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading books...</p>
                  </div>
                ) : booksError ? (
                  <div className="py-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Error loading books
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Please try again later.
                    </p>
                  </div>
                ) : filteredAvailableBooks.length > 0 ? (
                  filteredAvailableBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`book-${book.id}`}
                        checked={selectedBooks.includes(book.id)}
                        onCheckedChange={(checked: boolean) =>
                          handleBookSelection(book.id, checked)
                        }
                      />

                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`book-${book.id}`}
                          className="cursor-pointer"
                        >
                          <h4 className="text-sm font-medium text-gray-900">
                            {book.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            by {book.publisher || "Unknown Publisher"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ISBN: {book.isbn || "N/A"}
                          </p>
                          {book.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {book.description}
                            </p>
                          )}
                        </label>
                      </div>

                      <Badge
                        variant={book.is_published ? "default" : "secondary"}
                      >
                        {book.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No books found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search terms.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignBooksOpen(false);
                  setSelectedBooks([]);
                  setBookSearchTerm("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignBooks}
                disabled={
                  selectedBooks.length === 0 ||
                  isBooksLoading ||
                  !!booksError ||
                  assignBooksMutation.isPending
                }
              >
                {assignBooksMutation.isPending ? "Assigning..." : "Assign"}{" "}
                {selectedBooks.length > 0 ? `${selectedBooks.length} ` : ""}
                Books
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
