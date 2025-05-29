"use client";

import React, { useState } from "react";
import Link from "next/link";
import useBookCopies from "@/hooks/data/books/useBookCopies";
import useBooks from "@/hooks/data/books/useBooks";
import { useToast } from "@/hooks/useToast";
import type { BookCopyFilters } from "@/types/books";

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
                  <svg
                    className="h-6 w-6 text-blue-600"
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
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
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
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
            onValueChange={(value: any) => setStatusFilter(value)}
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
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {(copy as any).book?.title || "Unknown Book"}
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
