"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import useUpdateBook from "@/hooks/data/books/useUpdateBook";
import useBulkCreateCopies from "@/hooks/data/books/useBulkCreateCopies";
import useBookCopies from "@/hooks/data/books/useBookCopies";
import useBook from "@/hooks/data/books/useBook";
import { uploadFile } from "@/api/uploadFile";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Input } from "@/components/shadcn-components/input";
import { Textarea } from "@/components/shadcn-components/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn-components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-components/tabs";

interface Book {
  id: string;
  title: string;
  description: string | null;
  isbn: string | null;
  publisher: string | null;
  edition: string | null;
  cover_image_url: string | null;
  price: number | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string | null;
  publication_date: string | null;
  course_books?: Array<{
    course: {
      id: string;
      title: string;
      is_published: boolean;
    };
  }>;
}

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;
  const { toast } = useToast();

  // Fetch real book data
  const {
    data: bookResponse,
    isLoading: isBookLoading,
    error: bookError,
  } = useBook(bookId);
  const book = bookResponse?.data;

  const updateBookMutation = useUpdateBook();
  const bulkCreateCopiesMutation = useBulkCreateCopies();
  const { data: bookCopiesResponse } = useBookCopies({ book_id: bookId });
  const bookCopies = bookCopiesResponse?.data || [];

  const [isEditing, setIsEditing] = useState(false);
  const [showBulkCopiesModal, setShowBulkCopiesModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isbn: "",
    publisher: "",
    edition: "",
    price: 0,
    is_published: false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [bulkCopiesForm, setBulkCopiesForm] = useState({
    quantity: 10,
    code_prefix: "",
    batch_number: "",
  });

  // Update form when book data loads
  React.useEffect(() => {
    if (book) {
      setEditForm({
        title: book.title || "",
        description: book.description || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        edition: book.edition || "",
        price: book.price || 0,
        is_published: book.is_published || false,
      });
    }
  }, [book]);

  // Show loading state
  if (isBookLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading book details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (bookError || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-red-600">
              Error loading book details. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setCoverImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCoverImage = async (
    file: File,
    bookTitle: string,
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      const timestamp = Date.now();
      const filename = `book-cover-${timestamp}-${bookTitle.replace(/[^a-zA-Z0-9]/g, "-")}.${file.name.split(".").pop()}`;

      const imageUrl = await uploadFile({
        formData,
        name: "coverImage",
        title: filename,
      });

      return imageUrl;
    } catch (error) {
      console.error("Failed to upload cover image:", error);
      toast.error("Failed to upload cover image");
      return null;
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let coverImageUrl = book?.cover_image_url;
      if (coverImageFile) {
        const uploadedImageUrl = await uploadCoverImage(
          coverImageFile,
          editForm.title,
        );
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }

      await updateBookMutation.mutateAsync({
        bookId,
        bookData: {
          ...editForm,
          cover_image_url: coverImageUrl || undefined,
        },
      });

      setIsEditing(false);
      setCoverImageFile(null);
      setCoverImagePreview("");
      toast.success("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book");
    }
  };

  const handleBulkCreateCopies = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await bulkCreateCopiesMutation.mutateAsync({
        book_id: bookId,
        quantity: bulkCopiesForm.quantity,
        code_prefix: bulkCopiesForm.code_prefix || undefined,
        batch_number: bulkCopiesForm.batch_number || undefined,
      });

      setShowBulkCopiesModal(false);
      setBulkCopiesForm({
        quantity: 10,
        code_prefix: "",
        batch_number: "",
      });
      toast.success(
        `${bulkCopiesForm.quantity} book copies created successfully!`,
      );
    } catch (error) {
      console.error("Error creating book copies:", error);
      toast.error("Failed to create book copies");
    }
  };

  const availableCopies = bookCopies.filter(
    (copy) => copy.status === "available",
  ).length;
  const assignedCopies = bookCopies.filter(
    (copy) => copy.status === "assigned",
  ).length;

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
            Back to Books
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Book Details
              </h1>
              <p className="mt-1 text-gray-600">{book.title}</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit Book"}
              </Button>
              <Button onClick={() => setShowBulkCopiesModal(true)}>
                Create Book Copies
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="copies">
              Book Copies ({bookCopies.length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({book.course_books?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Book Cover & Basic Info */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-64 w-48 overflow-hidden rounded-lg border bg-gray-100">
                      {book.cover_image_url ? (
                        <Image
                          src={book.cover_image_url}
                          alt={book.title}
                          width={192}
                          height={256}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg
                            className="h-16 w-16 text-gray-400"
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
                    <Badge
                      variant={book.is_published ? "default" : "secondary"}
                    >
                      {book.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <p className="text-sm text-gray-900">
                        {book.is_published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Copies
                      </label>
                      <p className="text-sm text-gray-900">
                        {bookCopies.length}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Available
                      </label>
                      <p className="text-sm text-gray-900">{availableCopies}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Assigned
                      </label>
                      <p className="text-sm text-gray-900">{assignedCopies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Book Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Book Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleUpdateBook} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title *
                        </label>
                        <Input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            ISBN
                          </label>
                          <Input
                            value={editForm.isbn}
                            onChange={(e) =>
                              setEditForm({ ...editForm, isbn: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Publisher
                          </label>
                          <Input
                            value={editForm.publisher}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                publisher: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Edition
                          </label>
                          <Input
                            value={editForm.edition}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                edition: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Price ($)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Cover Image
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                        />
                        {coverImagePreview && (
                          <div className="mt-2">
                            <Image
                              src={coverImagePreview}
                              alt="Cover preview"
                              width={100}
                              height={130}
                              className="rounded border"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_published"
                          checked={editForm.is_published}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              is_published: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor="is_published"
                          className="text-sm text-gray-700"
                        >
                          Published
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="submit"
                          disabled={updateBookMutation.isPending}
                        >
                          {updateBookMutation.isPending
                            ? "Updating..."
                            : "Update Book"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Title
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {book?.title}
                        </p>
                      </div>

                      {book?.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Description
                          </label>
                          <p className="text-gray-900">{book.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {book?.isbn && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              ISBN
                            </label>
                            <p className="text-gray-900">{book.isbn}</p>
                          </div>
                        )}
                        {book?.publisher && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Publisher
                            </label>
                            <p className="text-gray-900">{book.publisher}</p>
                          </div>
                        )}
                        {book?.edition && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Edition
                            </label>
                            <p className="text-gray-900">{book.edition}</p>
                          </div>
                        )}
                        {book?.price && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Price
                            </label>
                            <p className="text-gray-900">
                              ${book.price.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Created
                          </label>
                          <p className="text-gray-900">
                            {new Date(book.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {book?.updated_at && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Last Updated
                            </label>
                            <p className="text-gray-900">
                              {new Date(book.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="copies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Book Copies</CardTitle>
                  <Button onClick={() => setShowBulkCopiesModal(true)}>
                    Create New Copies
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookCopies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Access Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Used By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookCopies.map((copy) => (
                        <TableRow key={copy.id}>
                          <TableCell className="font-mono text-sm">
                            {copy.access_code}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                copy.status === "available"
                                  ? "default"
                                  : copy.status === "assigned"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {copy.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{copy.batch_number || "-"}</TableCell>
                          <TableCell>{copy.serial_number || "-"}</TableCell>
                          <TableCell>
                            {new Date(
                              copy.created_at || "",
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {copy.access_code_used_by || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No book copies
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating book copies with access codes.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowBulkCopiesModal(true)}>
                        Create Book Copies
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Associated Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {book.course_books && book.course_books.length > 0 ? (
                  <div className="space-y-6">
                    {book.course_books.map((courseBook) => (
                      <div
                        key={courseBook.courses.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <svg
                                className="h-5 w-5 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {courseBook.courses.title}
                              </h4>
                              <Badge
                                variant={
                                  courseBook.courses.is_published
                                    ? "default"
                                    : "secondary"
                                }
                                className="mt-1"
                              >
                                {courseBook.courses.is_published
                                  ? "Published"
                                  : "Draft"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/courses/${courseBook.courses.id}`,
                              )
                            }
                          >
                            View Course
                          </Button>
                        </div>

                        {/* Course Lessons */}
                        {courseBook.courses.chapters && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <h5 className="mb-3 text-sm font-medium text-gray-700">
                              Course Content
                            </h5>
                            <div className="space-y-3">
                              {courseBook.courses.chapters.map(
                                (chapter, chapterIndex: number) => (
                                  <div key={chapter.id} className="space-y-2">
                                    <h6 className="text-sm font-medium text-gray-600">
                                      Chapter {chapterIndex + 1}:{" "}
                                      {chapter.title}
                                    </h6>
                                    {chapter.lessons &&
                                      chapter.lessons.length > 0 && (
                                        <div className="ml-4 space-y-2">
                                          {chapter.lessons.map(
                                            (lesson, lessonIndex: number) => (
                                              <div
                                                key={lesson.id}
                                                className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-2"
                                              >
                                                <div className="flex items-center space-x-2">
                                                  {lesson.lesson_type ===
                                                  "pdf" ? (
                                                    <svg
                                                      className="h-4 w-4 text-red-500"
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
                                                  ) : (
                                                    <svg
                                                      className="h-4 w-4 text-blue-500"
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
                                                  )}
                                                  <span className="text-sm text-gray-700">
                                                    Lesson {lessonIndex + 1}:{" "}
                                                    {lesson.title}
                                                  </span>
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                  >
                                                    {lesson.lesson_type ===
                                                    "pdf"
                                                      ? "PDF"
                                                      : "Video"}
                                                  </Badge>
                                                </div>

                                                {/* Download PDF Button */}
                                                {lesson.lesson_type === "pdf" &&
                                                  lesson.pdf_url && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => {
                                                        // Create a temporary link and trigger download
                                                        const link =
                                                          document.createElement(
                                                            "a",
                                                          );
                                                        link.href =
                                                          lesson.pdf_url || "";
                                                        link.download = `${lesson.title}.pdf`;
                                                        link.target = "_blank";
                                                        document.body.appendChild(
                                                          link,
                                                        );
                                                        link.click();
                                                        document.body.removeChild(
                                                          link,
                                                        );

                                                        toast.success(
                                                          "PDF download started!",
                                                        );
                                                      }}
                                                      className="text-xs"
                                                    >
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
                                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                      </svg>
                                                      Download PDF
                                                    </Button>
                                                  )}

                                                {/* Disabled state for PDF lessons without URL */}
                                                {lesson.lesson_type === "pdf" &&
                                                  !lesson.pdf_url && (
                                                    <Badge
                                                      variant="secondary"
                                                      className="text-xs"
                                                    >
                                                      PDF Not Available
                                                    </Badge>
                                                  )}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
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
                      No courses assigned
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This book is not currently assigned to any courses.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bulk Create Copies Modal */}
        <Dialog
          open={showBulkCopiesModal}
          onOpenChange={setShowBulkCopiesModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Book Copies</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBulkCreateCopies} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={bulkCopiesForm.quantity}
                  onChange={(e) =>
                    setBulkCopiesForm({
                      ...bulkCopiesForm,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code Prefix (optional)
                </label>
                <Input
                  value={bulkCopiesForm.code_prefix}
                  onChange={(e) =>
                    setBulkCopiesForm({
                      ...bulkCopiesForm,
                      code_prefix: e.target.value,
                    })
                  }
                  placeholder="e.g., BOOK2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Batch Number (optional)
                </label>
                <Input
                  value={bulkCopiesForm.batch_number}
                  onChange={(e) =>
                    setBulkCopiesForm({
                      ...bulkCopiesForm,
                      batch_number: e.target.value,
                    })
                  }
                  placeholder="e.g., BATCH001"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkCopiesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bulkCreateCopiesMutation.isPending}
                >
                  {bulkCreateCopiesMutation.isPending
                    ? "Creating..."
                    : `Create ${bulkCopiesForm.quantity} Copies`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
