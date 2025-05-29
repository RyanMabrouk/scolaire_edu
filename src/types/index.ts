// =============================================
// Centralized Types for eLearning Platform
// =============================================

import { Tables } from "./database.types";

// Re-export database types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./database.types";

// Database table types (using generated types)
export type Course = Tables<"courses">;
export type Chapter = Tables<"chapters">;
export type Lesson = Tables<"lessons">;
export type UserSession = Tables<"user_sessions">;
export type LessonProgress = Tables<"lesson_progress">;
export type Profile = Tables<"profiles">;

// Extended types with relations
export interface CourseWithChapters extends Course {
  chapters: ChapterWithLessons[];
}

export interface ChapterWithLessons extends Chapter {
  lessons: LessonWithAttachments[];
}

export interface LessonWithAttachments extends Lesson {
  progress?: LessonProgress;
}

// BMDRM API Types
export interface BMDRMInitRequest {
  totalChunks: number;
  fileSize: number;
  title: string;
  description?: string;
  tags?: string[];
}

export interface BMDRMInitResponse {
  uploadJobId: string;
  success: boolean;
  message?: string;
}

export interface BMDRMUploadRequest {
  uploadJobId: string;
  chunkNumber: number;
  hash: string;
  file: File | Blob;
}

export interface BMDRMUploadResponse {
  success: boolean;
  message?: string;
}

export interface BMDRMStateResponse {
  uploadJobId: string;
  state: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
}

export interface BMDRMClearResponse {
  success: boolean;
  videoId?: string;
  message?: string;
}

export interface BMDRMSessionRequest {
  videoId: string;
  userId: string;
}

export interface BMDRMSessionResponse {
  urlToEdge: string;
  success: boolean;
  message?: string;
}

// Form types for admin interface
export interface CourseFormData {
  title: string;
  description?: string;
  access_code?: string;
  is_published: boolean;
  cover_image?: File;
}

export interface ChapterFormData {
  title: string;
  description?: string;
  order_index: number;
}

export interface LessonFormData {
  title: string;
  description?: string;
  lesson_type: "bmdrm_video" | "pdf";
  order_index: number;
  duration_minutes?: number;
  video_file?: File;
  pdf_file?: File;
}

export interface AttachmentFormData {
  title: string;
  file: File;
}

// Access code redemption
export interface AccessCodeRedemptionRequest {
  accessCode: string;
}

export interface AccessCodeRedemptionResponse {
  success: boolean;
  message: string;
  course_title?: string;
  course_id?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Video upload progress tracking
export interface VideoUploadProgress {
  uploadJobId: string;
  progress: number;
  state: "initializing" | "uploading" | "processing" | "completed" | "failed";
  currentChunk?: number;
  totalChunks?: number;
  message?: string;
}

// User access checking
export interface UserAccessInfo {
  hasAccess: boolean;
  accessType?: "code" | "assigned";
  expiresAt?: string;
}

// Course enrollment
export interface EnrollmentRequest {
  courseId: string;
  accessType: "code" | "assigned";
  expiresAt?: string;
}

// Search and filtering
export interface CourseFilters {
  search?: string;
  isPublished?: boolean;
  createdBy?: string;
}

export interface LessonFilters {
  chapterId?: string;
  lessonType?: "bmdrm_video" | "pdf";
}

// Dashboard statistics
export interface AdminDashboardStats {
  totalCourses: number;
  totalUsers: number;
  activeSessions: number;
  popularCourses: Course[];
}

export interface UserDashboardStats {
  enrolledCourses: number;
  completedLessons: number;
  totalWatchTime: number;
  recentActivity: LessonProgress[];
}
