"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useBooks from "@/hooks/data/books/useBooks";
import useCreateBook from "@/hooks/data/books/useCreateBook";
import useUpdateBook from "@/hooks/data/books/useUpdateBook";
import useBulkCreateCopies from "@/hooks/data/books/useBulkCreateCopies";
import { uploadFile } from "@/api/uploadFile";
import { useToast } from "@/hooks/useToast";
import type { CreateBookRequest, UpdateBookRequest, Book } from "@/types/books";
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Eye,
  Loader2,
  Copy,
} from "lucide-react";

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
} from "@/components/shadcn-components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-components/table";
import { Checkbox } from "@/components/shadcn-components/checkbox";

export default function BooksManagementPage() {
  const { data: booksResponse, isLoading, error } = useBooks();
  const books = booksResponse?.data || [];
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const bulkCreateCopiesMutation = useBulkCreateCopies();
  const { toast } = useToast();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showBulkCopiesModal, setShowBulkCopiesModal] = useState<string | null>(
    null,
  );

  // Form states
  const [bookForm, setBookForm] = useState<CreateBookRequest>({
    title: "",
    description: "",
    isbn: "",
    publisher: "",
    edition: "",
    price: 0,
    is_published: false,
  });

  const [editBookForm, setEditBookForm] = useState<UpdateBookRequest>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [editCoverImageFile, setEditCoverImageFile] = useState<File | null>(
    null,
  );
  const [editCoverImagePreview, setEditCoverImagePreview] =
    useState<string>("");

  const [bulkCopiesForm, setBulkCopiesForm] = useState({
    quantity: 10,
    code_prefix: "",
    batch_number: "",
  });

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && book.is_published) ||
        (statusFilter === "draft" && !book.is_published);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setCoverImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCoverImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setEditCoverImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditCoverImagePreview(e.target?.result as string);
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

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload cover image if provided
      let coverImageUrl = "";
      if (coverImageFile) {
        const uploadedImageUrl = await uploadCoverImage(
          coverImageFile,
          bookForm.title,
        );
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }

      await createBookMutation.mutateAsync({
        ...bookForm,
        cover_image_url: coverImageUrl || undefined,
      });

      // Reset form on success
      setShowCreateForm(false);
      setBookForm({
        title: "",
        description: "",
        isbn: "",
        publisher: "",
        edition: "",
        price: 0,
        is_published: false,
      });
      setCoverImageFile(null);
      setCoverImagePreview("");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleEditBook = (book: Book) => {
    setEditBookForm({
      title: book.title,
      description: book.description || "",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      edition: book.edition || "",
      price: book.price || 0,
      is_published: book.is_published,
      cover_image_url: book.cover_image_url || "",
    });
    setEditCoverImageFile(null);
    setEditCoverImagePreview("");
    setShowEditForm(book.id);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditForm) return;

    try {
      // Upload new cover image if provided
      let coverImageUrl = editBookForm.cover_image_url;
      if (editCoverImageFile) {
        const uploadedImageUrl = await uploadCoverImage(
          editCoverImageFile,
          editBookForm.title || "book",
        );
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }

      await updateBookMutation.mutateAsync({
        bookId: showEditForm,
        bookData: {
          ...editBookForm,
          cover_image_url: coverImageUrl,
        },
      });

      // Reset form on success
      setShowEditForm(null);
      setEditBookForm({});
      setEditCoverImageFile(null);
      setEditCoverImagePreview("");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleBulkCreateCopies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBulkCopiesModal) return;

    await bulkCreateCopiesMutation.mutateAsync({
      book_id: showBulkCopiesModal,
      quantity: bulkCopiesForm.quantity,
      code_prefix: bulkCopiesForm.code_prefix,
      batch_number: bulkCopiesForm.batch_number,
    });

    // Only reset form on success (mutation handles success/error messages)
    setShowBulkCopiesModal(null);
    setBulkCopiesForm({ quantity: 10, code_prefix: "", batch_number: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading books...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
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

  const totalBooks = books.length;
  const publishedBooks = books.filter((b) => b.is_published).length;
  const draftBooks = totalBooks - publishedBooks;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Books Management
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your book catalog and generate access codes
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              Add New Book
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Books
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalBooks}
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
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {publishedBooks}
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
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {draftBooks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <Input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard/book-copies">Manage Copies</Link>
          </Button>
        </div>

        {/* Books Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {/* Cover Image */}
                      <div className="mr-4 flex h-16 w-12 flex-shrink-0 items-center justify-center overflow-hidden">
                        {book.cover_image_url ? (
                          <Image
                            src={book.cover_image_url}
                            alt={book.title}
                            width={48}
                            height={48}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {book.title}
                        </div>
                        {book.description && (
                          <div className="max-w-xs truncate text-sm text-gray-500">
                            {book.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{book.publisher || "—"}</TableCell>
                  <TableCell>{book.isbn || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={book.is_published ? "default" : "secondary"}
                    >
                      {book.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>${book.price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkCopiesModal(book.id)}
                      >
                        Generate Copies
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBook(book)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/books/${book.id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredBooks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">
              No books found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Create Book Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                type="text"
                required
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
              />
              {coverImagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <div className="mt-1 h-32 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={coverImagePreview}
                      alt="Book cover preview"
                      width={96}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={bookForm.description || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN</label>
                <Input
                  type="text"
                  value={bookForm.isbn || ""}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, isbn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher</label>
                <Input
                  type="text"
                  value={bookForm.publisher || ""}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, publisher: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Edition</label>
                <Input
                  type="text"
                  value={bookForm.edition || ""}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, edition: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={bookForm.price || 0}
                  onChange={(e) =>
                    setBookForm({
                      ...bookForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_published"
                checked={bookForm.is_published || false}
                onCheckedChange={(checked: boolean) =>
                  setBookForm({ ...bookForm, is_published: !!checked })
                }
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Published
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={createBookMutation.isPending}
                className="flex-1"
              >
                {createBookMutation.isPending ? "Creating..." : "Create Book"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCoverImageFile(null);
                  setCoverImagePreview("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog
        open={!!showEditForm}
        onOpenChange={(open) => !open && setShowEditForm(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBook} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                type="text"
                required
                value={editBookForm.title || ""}
                onChange={(e) =>
                  setEditBookForm({ ...editBookForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleEditCoverImageUpload}
              />
              {editCoverImagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">New Preview:</p>
                  <div className="mt-1 h-32 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={editCoverImagePreview}
                      alt="Book cover preview"
                      width={96}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              {!editCoverImagePreview && editBookForm.cover_image_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current Cover:</p>
                  <div className="mt-1 h-32 w-24 overflow-hidden rounded-lg border">
                    <Image
                      src={editBookForm.cover_image_url}
                      alt="Current book cover"
                      width={96}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editBookForm.description || ""}
                onChange={(e) =>
                  setEditBookForm({
                    ...editBookForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN</label>
                <Input
                  type="text"
                  value={editBookForm.isbn || ""}
                  onChange={(e) =>
                    setEditBookForm({ ...editBookForm, isbn: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher</label>
                <Input
                  type="text"
                  value={editBookForm.publisher || ""}
                  onChange={(e) =>
                    setEditBookForm({
                      ...editBookForm,
                      publisher: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Edition</label>
                <Input
                  type="text"
                  value={editBookForm.edition || ""}
                  onChange={(e) =>
                    setEditBookForm({
                      ...editBookForm,
                      edition: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editBookForm.price || 0}
                  onChange={(e) =>
                    setEditBookForm({
                      ...editBookForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_published"
                checked={editBookForm.is_published || false}
                onCheckedChange={(checked: boolean) =>
                  setEditBookForm({
                    ...editBookForm,
                    is_published: !!checked,
                  })
                }
              />
              <label
                htmlFor="edit_is_published"
                className="text-sm font-medium"
              >
                Published
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updateBookMutation.isPending}
                className="flex-1"
              >
                {updateBookMutation.isPending ? "Updating..." : "Update Book"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(null);
                  setEditCoverImageFile(null);
                  setEditCoverImagePreview("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Copies Dialog */}
      <Dialog
        open={!!showBulkCopiesModal}
        onOpenChange={(open) => !open && setShowBulkCopiesModal(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Book Copies</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkCreateCopies} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                required
                min="1"
                max="1000"
                value={bulkCopiesForm.quantity}
                onChange={(e) =>
                  setBulkCopiesForm({
                    ...bulkCopiesForm,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code Prefix</label>
              <Input
                type="text"
                value={bulkCopiesForm.code_prefix}
                onChange={(e) =>
                  setBulkCopiesForm({
                    ...bulkCopiesForm,
                    code_prefix: e.target.value,
                  })
                }
                placeholder="e.g., BOOK2024-"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Number</label>
              <Input
                type="text"
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
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={bulkCreateCopiesMutation.isPending}
                className="flex-1"
              >
                {bulkCreateCopiesMutation.isPending
                  ? "Generating..."
                  : "Generate Copies"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBulkCopiesModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
