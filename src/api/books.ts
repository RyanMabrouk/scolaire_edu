"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Book,
  BookCopy,
  CreateBookRequest,
  UpdateBookRequest,
  CreateBookCopyRequest,
  BulkCreateCopiesRequest,
  BulkCreateCopiesResponse,
  GrantAccessRequest,
  GrantAccessResponse,
  BookFilters,
  BookCopyFilters,
  CourseBookInsert,
} from "@/types/books";

// Book management functions

export async function createBook(bookData: CreateBookRequest) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data: book, error } = await supabase
    .from("books")
    .insert({
      ...bookData,
      created_by: user.user.id,
    })
    .select()
    .single();

  return { data: book, error };
}

export async function updateBook(bookId: string, bookData: UpdateBookRequest) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data: book, error } = await supabase
    .from("books")
    .update(bookData)
    .eq("id", bookId)
    .select()
    .single();

  return { data: book, error };
}

export async function getBooks(filters?: BookFilters) {
  const supabase = createClient();

  let query = supabase.from("books").select("*");

  if (filters?.is_published !== undefined) {
    query = query.eq("is_published", filters.is_published);
  }

  if (filters?.publisher) {
    query = query.eq("publisher", filters.publisher);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  const { data: books, error } = await query.order("created_at", {
    ascending: false,
  });

  return { data: books, error };
}

export async function getBook(bookId: string) {
  const supabase = createClient();

  const { data: book, error } = await supabase
    .from("books")
    .select(
      `
      *,
      course_books (
        *,
        course:courses (*)
      )
    `,
    )
    .eq("id", bookId)
    .single();

  return { data: book, error };
}

export async function deleteBook(bookId: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data, error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId);

  return { data, error };
}

// Book copy management functions

export async function createBookCopy(copyData: CreateBookCopyRequest) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  // Generate access code if not provided
  const accessCode =
    copyData.access_code ||
    Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data: copy, error } = await supabase
    .from("book_copies")
    .insert({
      ...copyData,
      access_code: accessCode,
    })
    .select()
    .single();

  return { data: copy, error };
}

export async function bulkCreateBookCopies(
  request: BulkCreateCopiesRequest,
): Promise<{ data: BulkCreateCopiesResponse | null; error: any }> {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  // Generate multiple book copies
  const copies = [];
  const codePrefix = request.code_prefix?.trim() || "";
  const batchNumber = request.batch_number?.trim() || "";

  for (let i = 0; i < request.quantity; i++) {
    // Generate unique access code
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const accessCode = codePrefix
      ? `${codePrefix}${randomSuffix}`
      : randomSuffix;

    // Generate serial number
    const serialNumber = `${Date.now()}-${i + 1}`;

    copies.push({
      book_id: request.book_id,
      access_code: accessCode,
      serial_number: serialNumber,
      batch_number: batchNumber || null,
      status: "available" as const,
    });
  }

  // Insert all copies at once
  const { data: insertedCopies, error } = await supabase
    .from("book_copies")
    .insert(copies)
    .select();

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      success: true,
      message: `Successfully created ${request.quantity} book copies`,
      codes_created: insertedCopies?.map((copy) => copy.access_code) || [],
    },
    error: null,
  };
}

export async function getBookCopies(filters?: BookCopyFilters) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  let query = supabase.from("book_copies").select(`
      *,
      book:books (*)
    `);

  if (filters?.book_id) {
    query = query.eq("book_id", filters.book_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.batch_number) {
    query = query.eq("batch_number", filters.batch_number);
  }

  if (filters?.search) {
    query = query.or(
      `access_code.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`,
    );
  }

  const { data: copies, error } = await query.order("created_at", {
    ascending: false,
  });

  return { data: copies, error };
}

export async function updateBookCopy(
  copyId: string,
  updates: Partial<BookCopy>,
) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data: copy, error } = await supabase
    .from("book_copies")
    .update(updates)
    .eq("id", copyId)
    .select()
    .single();

  return { data: copy, error };
}

// Course-Book relationship functions

export async function assignCourseToBook(request: CourseBookInsert) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data: courseBook, error } = await supabase
    .from("course_books")
    .insert(request)
    .select()
    .single();

  return { data: courseBook, error };
}

export async function removeCourseFromBook(courseId: string, bookId: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: null, error: "User not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Admin access required" };
  }

  const { data, error } = await supabase
    .from("course_books")
    .delete()
    .eq("course_id", courseId)
    .eq("book_id", bookId);

  return { data, error };
}

// Access management functions

export async function grantAccessViaCode(
  request: GrantAccessRequest,
): Promise<{ data: GrantAccessResponse | null; error: any }> {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return {
      data: {
        success: false,
        message: "User not authenticated",
        courses_granted: [],
      },
      error: null,
    };
  }

  // Find the book copy with the given access code
  const { data: bookCopy, error: copyError } = await supabase
    .from("book_copies")
    .select(
      `
      *,
      book:books (
        *,
        course_books (
          course:courses (*)
        )
      )
    `,
    )
    .eq("access_code", request.unique_code)
    .eq("status", "available")
    .single();

  if (copyError || !bookCopy) {
    return {
      data: {
        success: false,
        message: "Invalid or already used access code",
        courses_granted: [],
      },
      error: null,
    };
  }

  // Mark the copy as used
  const { error: updateError } = await supabase
    .from("book_copies")
    .update({
      status: "assigned",
      access_code_used_by: user.user.id,
      used_at: new Date().toISOString(),
    })
    .eq("id", bookCopy.id);

  if (updateError) {
    return { data: null, error: updateError };
  }

  // Get all courses associated with this book
  const courses = bookCopy.book?.course_books?.map((cb) => cb.course) || [];
  const courseIds = courses.map((course) => course.id);

  return {
    data: {
      success: true,
      message: `Access granted to ${courseIds.length} course(s)`,
      courses_granted: courseIds,
    },
    error: null,
  };
}

export async function checkUserCourseAccess(courseId: string, userId?: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: false, error: "User not authenticated" };
  }

  const targetUserId = userId || user.user.id;

  // Check if user has access through book copies
  const { data: bookCopies, error } = await supabase
    .from("book_copies")
    .select(
      `
      *,
      book:books (
        course_books!inner (
          course_id
        )
      )
    `,
    )
    .eq("access_code_used_by", targetUserId)
    .eq("status", "assigned")
    .eq("book.course_books.course_id", courseId);

  if (error) {
    return { data: false, error };
  }

  const hasAccess = bookCopies && bookCopies.length > 0;
  return { data: hasAccess, error: null };
}
