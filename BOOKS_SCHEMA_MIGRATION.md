# Books and Copies Schema Migration

## Overview

This document describes the new database schema that properly separates courses, books, and physical book copies with unique access codes. The new schema addresses the limitation where the system incorrectly treated each course as a single book.

## Schema Design

### Core Entities

#### 1. **Books** (`public.books`)

Published works that can cover multiple courses.

```sql
CREATE TABLE public.books (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    isbn TEXT UNIQUE,
    publisher TEXT,
    publication_date DATE,
    edition TEXT,
    cover_image_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **Course-Books Relationship** (`public.course_books`)

Many-to-many relationship between courses and books.

```sql
CREATE TABLE public.course_books (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id),
    book_id UUID REFERENCES public.books(id),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, book_id)
);
```

#### 3. **Book Copies** (`public.book_copies`)

Physical instances of books with unique access codes.

```sql
CREATE TABLE public.book_copies (
    id UUID PRIMARY KEY,
    book_id UUID REFERENCES public.books(id),
    unique_code TEXT NOT NULL UNIQUE,
    serial_number TEXT,
    batch_number TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'expired', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT
);
```

#### 4. **User Book Access** (`public.user_book_access`)

Tracks which users have access through which book copies.

```sql
CREATE TABLE public.user_book_access (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    book_copy_id UUID REFERENCES public.book_copies(id),
    access_granted_at TIMESTAMPTZ DEFAULT NOW(),
    access_expires_at TIMESTAMPTZ,
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, book_copy_id)
);
```

## Relationships

### Many-to-Many: Courses ↔ Books

- A single course can be covered by multiple books
- A single book can be relevant to multiple courses
- Managed through the `course_books` junction table

### One-to-Many: Books → Copies

- Each book can have many physical copies
- Each copy belongs to exactly one book
- Each copy has a unique access code

### One-to-Many: Copies → User Access

- Each copy can be assigned to one user
- Users can have access to multiple copies
- Access is tracked through `user_book_access`

## Access Control Flow

```
User submits unique_code
    ↓
Find book_copy by unique_code
    ↓
Get associated book
    ↓
Get all courses linked to that book
    ↓
Grant user access to all those courses
```

## Key Functions

### 1. Grant Access via Copy Code

```sql
SELECT * FROM public.grant_access_via_copy_code('ABC123XYZ');
```

### 2. Check User Course Access

```sql
SELECT public.user_has_course_access_via_books(user_id, course_id);
```

### 3. Bulk Create Book Copies

```sql
SELECT * FROM public.create_book_copies_bulk(book_id, 100, 'BATCH1-');
```

## Migration Process

### Step 1: Apply the Migration

```bash
supabase db push --file supabase/migrations/00003_books_and_copies_schema.sql
```

### Step 2: Create Books and Link to Courses

```typescript
// Create a book
const book = await createBook({
  title: "Advanced Mathematics Textbook",
  description: "Comprehensive guide to advanced mathematics",
  isbn: "978-0123456789",
  publisher: "Academic Press",
  is_published: true,
});

// Link book to courses
await assignCourseToBook({
  course_id: "course-uuid",
  book_id: book.id,
  is_primary: true,
});
```

### Step 3: Generate Book Copies

```typescript
// Create 100 copies with unique codes
const result = await bulkCreateBookCopies({
  book_id: book.id,
  quantity: 100,
  code_prefix: "MATH2024-",
  batch_number: "BATCH001",
});

console.log(result.codes_created); // Array of generated codes
```

### Step 4: Users Redeem Access Codes

```typescript
// User submits their access code
const result = await grantAccessViaCode({
  unique_code: "MATH2024-ABC123XY",
});

if (result.success) {
  console.log(`Access granted to courses: ${result.courses_granted}`);
}
```

## Backward Compatibility

The migration maintains backward compatibility through:

1. **Unified View**: `user_course_access_unified` combines old and new access patterns
2. **Course Access Codes**: Added `access_code` fields to existing courses table
3. **Existing APIs**: Current course access APIs continue to work

## API Usage Examples

### Book Management

```typescript
import { createBook, getBooks, updateBook, deleteBook } from "@/api/books";

// Create a new book
const book = await createBook({
  title: "Physics Fundamentals",
  description: "Introduction to physics concepts",
  price: 49.99,
  is_published: true,
});

// Get all published books
const books = await getBooks({ is_published: true });

// Update book
await updateBook(book.id, { price: 39.99 });
```

### Copy Management

```typescript
import {
  bulkCreateBookCopies,
  getBookCopies,
  updateBookCopy,
} from "@/api/books";

// Create 50 copies
const result = await bulkCreateBookCopies({
  book_id: book.id,
  quantity: 50,
  code_prefix: "PHYS-",
  batch_number: "2024-Q1",
});

// Get all copies for a book
const copies = await getBookCopies({ book_id: book.id });

// Disable a copy
await updateBookCopy(copy.id, { status: "disabled" });
```

### Access Management

```typescript
import {
  grantAccessViaCode,
  checkUserCourseAccess,
  getUserBookAccess,
} from "@/api/books";

// User redeems access code
const access = await grantAccessViaCode({
  unique_code: "PHYS-ABC123XY",
});

// Check if user has access to specific course
const hasAccess = await checkUserCourseAccess(courseId);

// Get all user's book access
const userAccess = await getUserBookAccess();
```

## Admin Interface Integration

### Books Management Page

- Create/edit books
- Manage book metadata (ISBN, publisher, etc.)
- Link books to courses
- View book statistics

### Copies Management Page

- Bulk generate access codes
- View copy status and assignments
- Export codes for distribution
- Track usage analytics

### Access Codes Page

- View all generated codes
- Filter by book, batch, status
- Manually assign/revoke access
- Export code lists

## Benefits of New Schema

1. **Proper Separation**: Clear distinction between courses, books, and physical copies
2. **Scalability**: Support for multiple books per course and multiple courses per book
3. **Flexibility**: Different access patterns (codes, assignments, purchases)
4. **Tracking**: Detailed audit trail of code usage and access grants
5. **Batch Management**: Organize copies by batches for easier distribution
6. **Expiration Support**: Time-limited access through copy and access expiration

## Security Considerations

1. **Unique Codes**: Each copy has a cryptographically secure unique code
2. **Status Tracking**: Prevent reuse of assigned/expired codes
3. **Access Expiration**: Support for time-limited access
4. **Admin Controls**: Comprehensive admin interface for access management
5. **Audit Trail**: Complete history of access grants and usage

## Performance Optimizations

1. **Indexes**: Comprehensive indexing on frequently queried fields
2. **RLS Policies**: Efficient row-level security policies
3. **Batch Operations**: Bulk operations for creating multiple copies
4. **Caching**: Consider caching frequently accessed book/course relationships

## Future Enhancements

1. **QR Codes**: Generate QR codes for physical book distribution
2. **Analytics**: Detailed usage analytics and reporting
3. **Integration**: Integration with external book databases (ISBN lookup)
4. **Mobile App**: Mobile app for code redemption
5. **Notifications**: Email notifications for access grants and expirations
