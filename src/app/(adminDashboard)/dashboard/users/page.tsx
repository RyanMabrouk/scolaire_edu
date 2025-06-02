"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import useUsers from "@/hooks/data/user/useUsers";
import useDeleteUser from "@/hooks/data/user/useDeleteUser";
import useUpdateUserStatus from "@/hooks/data/user/useUpdateUserStatus";
import useUserBookCopies from "@/hooks/data/user/useUserBookCopies";
import {
  Users,
  CheckCircle,
  XCircle,
  Book,
  GraduationCap,
  Search,
  Eye,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-components/avatar";

export default function AdminUsersPage() {
  const { data: usersResponse, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const updateUserStatusMutation = useUpdateUserStatus();
  const users = usersResponse?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<
    "all" | "active" | "inactive" | "disabled"
  >("all");
  const [sortBy, setSortBy] = useState<"created_at" | "email" | "last_sign_in">(
    "created_at",
  );
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name &&
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "active" &&
          user.book_copies_count > 0 &&
          !user.disabled) ||
        (activityFilter === "inactive" &&
          user.book_copies_count === 0 &&
          !user.disabled) ||
        (activityFilter === "disabled" && user.disabled);

      return matchesSearch && matchesActivity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "email":
          return a.email.localeCompare(b.email);
        case "last_sign_in":
          if (!a.last_sign_in_at && !b.last_sign_in_at) return 0;
          if (!a.last_sign_in_at) return 1;
          if (!b.last_sign_in_at) return -1;
          return (
            new Date(b.last_sign_in_at).getTime() -
            new Date(a.last_sign_in_at).getTime()
          );
        case "created_at":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  const deleteUser = async (userId: string, userEmail: string) => {
    // Show warning toast before deletion
    toast.warning(
      "Deleting user...",
      `Removing "${userEmail}" and all their data.`,
    );
    await deleteUserMutation.mutateAsync(userId);
  };

  const toggleUserStatus = async (
    userId: string,
    userEmail: string,
    currentlyDisabled: boolean,
  ) => {
    const action = currentlyDisabled ? "enable" : "disable";
    toast.info(
      `${action === "enable" ? "Enabling" : "Disabling"} user...`,
      `${action === "enable" ? "Restoring" : "Restricting"} access for "${userEmail}".`,
    );
    await updateUserStatusMutation.mutateAsync({
      userId,
      disabled: !currentlyDisabled,
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (email: string, fullName?: string) => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const openUserDetail = (userId: string) => {
    setSelectedUser(userId);
    setIsUserDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading users...</p>
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
              Error loading users. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stats calculations
  const activeUsers = users.filter(
    (u) => u.book_copies_count > 0 && !u.disabled,
  );
  const disabledUsers = users.filter((u) => u.disabled);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                👥 User Management
              </h1>
              <p className="mt-1 text-gray-600">
                Manage user accounts and monitor their learning activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.length}
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
                    Active Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {activeUsers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-red-100 p-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Disabled Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {disabledUsers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Book className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Books
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.reduce(
                      (total, user) => total + user.book_copies_count,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-orange-100 p-2">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Courses
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.reduce(
                      (total, user) => total + user.courses_count,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Select
                  value={activityFilter}
                  onValueChange={(value) =>
                    setActivityFilter(
                      value as "all" | "active" | "inactive" | "disabled",
                    )
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "created_at" | "email" | "last_sign_in")
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Sort by Date</SelectItem>
                    <SelectItem value="email">Sort by Email</SelectItem>
                    <SelectItem value="last_sign_in">Last Sign In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || activityFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No users have registered yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={user.disabled ? "opacity-60" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {getInitials(user.email, user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || "No name"}
                              {user.disabled && (
                                <span className="ml-2 text-xs text-red-500">
                                  (Disabled)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.disabled ? "destructive" : "default"}
                        >
                          {user.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className="text-nowrap text-xs"
                            variant={
                              user.book_copies_count > 0 && !user.disabled
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.book_copies_count} books
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-nowrap text-xs"
                          >
                            {user.courses_count} courses
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.last_sign_in_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDetail(user.id)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant={user.disabled ? "default" : "secondary"}
                            size="sm"
                            onClick={() =>
                              toggleUserStatus(
                                user.id,
                                user.email,
                                user.disabled,
                              )
                            }
                            disabled={
                              updateUserStatusMutation.isPending &&
                              updateUserStatusMutation.variables?.userId ===
                                user.id
                            }
                          >
                            {updateUserStatusMutation.isPending &&
                            updateUserStatusMutation.variables?.userId ===
                              user.id ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : user.disabled ? (
                              <UserCheck className="mr-1 h-4 w-4" />
                            ) : (
                              <UserX className="mr-1 h-4 w-4" />
                            )}
                            {updateUserStatusMutation.isPending &&
                            updateUserStatusMutation.variables?.userId ===
                              user.id
                              ? "Updating..."
                              : user.disabled
                                ? "Enable"
                                : "Disable"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id, user.email)}
                            disabled={
                              deleteUserMutation.isPending &&
                              deleteUserMutation.variables === user.id
                            }
                          >
                            {deleteUserMutation.isPending &&
                            deleteUserMutation.variables === user.id ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1 h-4 w-4" />
                            )}
                            {deleteUserMutation.isPending &&
                            deleteUserMutation.variables === user.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal
            userId={selectedUser}
            isOpen={isUserDetailOpen}
            onClose={() => {
              setIsUserDetailOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function UserDetailModal({
  userId,
  isOpen,
  onClose,
}: {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: bookCopiesResponse, isLoading } = useUserBookCopies(userId);
  const bookCopies = bookCopiesResponse?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📖 User Book Access Details</DialogTitle>
          <DialogDescription>
            View all books and courses this user has access to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Loading user data...</p>
            </div>
          ) : bookCopies.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No books accessed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This user hasn't used any access codes yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookCopies.map((copy) => (
                <Card key={copy.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {copy.book.cover_image_url ? (
                          <Image
                            src={copy.book.cover_image_url}
                            alt={copy.book.title}
                            width={48}
                            height={64}
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
                          {copy.book.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          by {copy.book.publisher}
                        </p>
                        <p className="text-xs text-gray-400">
                          ISBN: {copy.book.isbn}
                        </p>
                        <p className="text-xs text-gray-400">
                          Access Code: {copy.access_code}
                        </p>
                        <p className="text-xs text-gray-400">
                          Used:{" "}
                          {new Date(copy.used_at || "").toLocaleDateString()}
                        </p>

                        {copy.book.course_books &&
                          copy.book.course_books.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">
                                Related Courses:
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {copy.book.course_books.map((courseBook) => (
                                  <Badge
                                    key={courseBook.course.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {courseBook.course.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <Badge
                        variant={
                          copy.status === "assigned" ? "default" : "secondary"
                        }
                      >
                        {copy.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
