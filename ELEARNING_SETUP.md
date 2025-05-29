# eLearning Platform Setup Guide

## Overview

This eLearning platform integrates Next.js, Supabase, and BMDRM to provide a comprehensive educational experience with:

- **Video Lessons**: DRM-protected video content via BMDRM
- **PDF Lessons**: Document-based learning materials
- **User Management**: Authentication and role-based access control
- **Course Management**: Admin interface for content creation
- **Progress Tracking**: User progress monitoring
- **Access Control**: Purchase-based and assignment-based access

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# BMDRM Configuration
BMDRM_BASE_URL=https://api.bmdrm.com
BMDRM_UPLOAD_API_KEY=your_bmdrm_upload_api_key
BMDRM_SESSION_API_KEY=your_bmdrm_session_api_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: File Upload Configuration
MAX_FILE_SIZE=5368709120  # 5GB in bytes
CHUNK_SIZE=10485760       # 10MB in bytes

# Optional: Session Configuration
SESSION_TIMEOUT=86400     # 24 hours in seconds
```

## Database Setup

1. **Run the initial profiles migration** (if not already done):

   ```bash
   supabase db push --file supabase-setup.sql
   ```

2. **Run the eLearning schema migration**:

   ```bash
   supabase db push --file supabase/migrations/00002_elearning_schema.sql
   ```

3. **Verify the tables were created**:
   - `courses`
   - `chapters`
   - `lessons`
   - `attachments`
   - `user_course_access`
   - `user_sessions`
   - `lesson_progress`

## BMDRM Integration

### API Keys Setup

1. **Upload API Key** (`BMDRM_UPLOAD_API_KEY`):

   - Used for video upload operations (`/Init`, `/Upload`, `/State`, `/Clear`)
   - Header name: `API-KEY`

2. **Session API Key** (`BMDRM_SESSION_API_KEY`):
   - Used for video playback session creation (`/Sessions`)
   - Header name: `apiKey`

### Video Upload Workflow

1. **Initialize Upload**: Call `/api/bmdrm/init` with video metadata
2. **Upload Chunks**: Call `/api/bmdrm/upload` for each video chunk
3. **Monitor Progress**: Call `/api/bmdrm/state` to check upload status
4. **Finalize Upload**: Call `/api/bmdrm/clear` to complete and apply DRM

### Video Playback Workflow

1. **Request Session**: Call `/api/bmdrm/session` with `videoId` and `lessonId`
2. **Receive URL**: Get secure `urlToEdge` for video playback
3. **Play Video**: Use the URL in the video player component

## File Structure

```
src/
├── app/
│   ├── (adminDashboard)/
│   │   └── dashboard/
│   │       └── courses/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── home/
│   │   └── courses/
│   └── api/
│       ├── bmdrm/
│       │   ├── init/
│       │   ├── upload/
│       │   ├── state/
│       │   ├── clear/
│       │   └── session/
│       └── courses/
├── components/
│   ├── admin/
│   │   ├── VideoUpload.tsx
│   │   └── CourseManagement.tsx
│   ├── course/
│   │   └── CourseContent.tsx
│   └── player/
│       ├── BMDRMVideoPlayer.tsx
│       └── PDFViewer.tsx
├── types/
│   └── elearning.ts
└── lib/
    └── supabase/
```

## Key Features

### 1. Course Management (Admin)

- Create and edit courses
- Upload video content via BMDRM
- Upload PDF lessons to Supabase Storage
- Manage chapters and lessons
- Set course pricing and access controls

### 2. User Experience

- Browse available courses
- Access purchased or assigned content
- Watch DRM-protected videos
- View PDF lessons with built-in viewer
- Track learning progress

### 3. Access Control

- Role-based authentication (admin/user)
- Course-level access control
- Purchase-based access
- Assignment-based access
- Session management with single active session enforcement

### 4. Video Features (BMDRM)

- Chunked upload for large files
- Real-time upload progress tracking
- DRM protection
- Secure video streaming
- Progress tracking

### 5. PDF Features

- Supabase Storage integration
- Built-in PDF viewer
- Download capabilities
- Responsive design

## API Endpoints

### BMDRM Integration

- `POST /api/bmdrm/init` - Initialize video upload
- `POST /api/bmdrm/upload` - Upload video chunks
- `GET /api/bmdrm/state` - Check upload progress
- `POST /api/bmdrm/clear` - Finalize upload
- `POST /api/bmdrm/session` - Get video playback URL

### Course Management

- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get course details
- `PATCH /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

## Security Considerations

1. **API Key Protection**: BMDRM API keys are stored server-side only
2. **Row Level Security**: Supabase RLS policies protect data access
3. **Authentication**: All API routes verify user authentication
4. **Authorization**: Admin-only routes check user roles
5. **Session Management**: Single active session per user
6. **DRM Protection**: Videos are protected via BMDRM

## Deployment

1. **Environment Setup**: Configure all environment variables
2. **Database Migration**: Run Supabase migrations
3. **Build Application**: `npm run build`
4. **Deploy**: Deploy to your preferred platform (Vercel, Netlify, etc.)

## Development

1. **Install Dependencies**: `npm install`
2. **Setup Environment**: Copy environment variables
3. **Run Database Migrations**: Setup Supabase schema
4. **Start Development**: `npm run dev`

## Troubleshooting

### Common Issues

1. **BMDRM Upload Fails**:

   - Check API key configuration
   - Verify file size limits
   - Check network connectivity

2. **Video Playback Issues**:

   - Verify session API key
   - Check user access permissions
   - Ensure video was properly finalized

3. **Database Errors**:
   - Verify Supabase connection
   - Check RLS policies
   - Ensure migrations were applied

### Support

For technical support:

1. Check the console for error messages
2. Verify environment variable configuration
3. Test API endpoints individually
4. Check Supabase logs for database issues
5. Verify BMDRM API responses

## Next Steps

1. **Payment Integration**: Add Stripe or similar for course purchases
2. **Email Notifications**: Setup email for course assignments
3. **Analytics**: Add learning analytics and reporting
4. **Mobile App**: Consider React Native implementation
5. **Advanced Features**: Quizzes, certificates, discussions
