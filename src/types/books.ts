// Types for the new Books and Copies schema
import type { Tables, TablesInsert, TablesUpdate } from "./index";
import type { Course } from "./index";

// Use database-generated types
export type Book = Tables<"books">;
export type CourseBook = Tables<"course_books">;
export type BookCopy = Tables<"book_copies">;

// Insert and Update types
export type BookInsert = TablesInsert<"books">;
export type BookUpdate = TablesUpdate<"books">;
export type CourseBookInsert = TablesInsert<"course_books">;
export type BookCopyInsert = TablesInsert<"book_copies">;
export type BookCopyUpdate = TablesUpdate<"book_copies">;

// Extended types with relations
export interface BookWithCourses extends Book {
  course_books: CourseBook[];
  courses: Course[];
}

export interface CourseWithBooks extends Course {
  course_books: CourseBook[];
  books: Book[];
}

export interface BookCopyWithDetails extends BookCopy {
  book: Book;
}

// API request/response types
export type CreateBookRequest = Omit<
  BookInsert,
  "id" | "created_at" | "updated_at" | "created_by"
>;
export type UpdateBookRequest = Partial<CreateBookRequest>;
export type CreateBookCopyRequest = Omit<
  BookCopyInsert,
  "id" | "created_at" | "access_code_used_by"
>;

export interface BulkCreateCopiesRequest {
  book_id: string;
  quantity: number;
  code_prefix?: string;
  batch_number?: string;
}

export interface BulkCreateCopiesResponse {
  success: boolean;
  message: string;
  codes_created: string[];
}

export interface GrantAccessRequest {
  unique_code: string;
}

export interface GrantAccessResponse {
  success: boolean;
  message: string;
  courses_granted: string[];
}

// Filter and query types
export interface BookFilters {
  is_published?: boolean;
  publisher?: string;
  search?: string;
}

export interface BookCopyFilters {
  book_id?: string;
  status?: BookCopy["status"];
  batch_number?: string;
  search?: string;
}

export interface UserBookAccessFilters {
  user_id?: string;
  book_id?: string;
  expired?: boolean;
}
