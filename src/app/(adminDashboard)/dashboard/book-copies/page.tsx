"use client";

import React, { useState } from "react";
import Link from "next/link";
import useBookCopies from "@/hooks/data/books/useBookCopies";
import useBooks from "@/hooks/data/books/useBooks";
import { useToast } from "@/hooks/useToast";
import type { BookCopyFilters } from "@/types/books";
import {
  BookOpen,
  CheckCircle,
  Users,
  AlertTriangle,
  Copy,
  Download,
  Loader2,
} from "lucide-react";

// shadcn components
import { Button } from "@/components/shadcn-components/button";
import { Input } from "@/components/shadcn-components/input";
import { Badge } from "@/components/shadcn-components/badge";
import { Card, CardContent } from "@/components/shadcn-components/card";
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

export default function BookCopiesPage() {
  const [filters, setFilters] = useState<BookCopyFilters>({});
  const { data: copiesResponse, isLoading, error } = useBookCopies(filters);
  const { data: booksResponse } = useBooks();
  const { toast } = useToast();

  const copies = copiesResponse?.data || [];
  const books = booksResponse?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "assigned" | "expired" | "disabled"
  >("all");
  const [bookFilter, setBookFilter] = useState<string>("all");

  const filteredCopies = copies
    .filter((copy) => {
      const matchesSearch =
        copy.access_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copy.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copy.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || copy.status === statusFilter;

      const matchesBook = bookFilter === "all" || copy.book_id === bookFilter;

      return matchesSearch && matchesStatus && matchesBook;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime(),
    );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", text);
  };

  const exportCodes = () => {
    const codes = filteredCopies.map((copy) => copy.access_code).join("\n");
    const blob = new Blob([codes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "book-access-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading book copies...</p>
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
              Error loading book copies. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalCopies = copies.length;
  const availableCopies = copies.filter((c) => c.status === "available").length;
  const assignedCopies = copies.filter((c) => c.status === "assigned").length;
  const expiredCopies = copies.filter((c) => c.status === "expired").length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📋 Book Copies Management
              </h1>
              <p className="mt-1 text-gray-600">
                Manage access codes and track usage
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCodes} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Export Codes
              </Button>
              <Button asChild>
                <Link href="/dashboard/books">Manage Books</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Copies
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalCopies}
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
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {availableCopies}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {assignedCopies}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {expiredCopies}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            type="text"
            placeholder="Search access codes, serial numbers, or batch numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bookFilter} onValueChange={setBookFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Copies Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Access Code</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCopies.map((copy) => (
                <TableRow key={copy.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                        {copy.access_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(copy.access_code)}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {copy.book?.title || "Unknown Book"}
                    </div>
                  </TableCell>
                  <TableCell>{copy.batch_number || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        copy.status === "available"
                          ? "default"
                          : copy.status === "assigned"
                            ? "secondary"
                            : copy.status === "expired"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {copy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {copy.created_at
                      ? new Date(copy.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(copy.access_code)}
                      >
                        Copy
                      </Button>
                      {copy.status === "available" && (
                        <Button variant="outline" size="sm">
                          Disable
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredCopies.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">
              No book copies found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
