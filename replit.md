# Photo Editing App - AI-Powered Image Transformation

## Overview

An AI-powered photo editing web application that enables users to transform images using natural language prompts. Built with React, Express, and Google's Gemini 2.5 Flash Image API, the application provides an intuitive canvas-first editing experience inspired by Figma's workspace model and Linear's polish.

Users can upload images, describe desired transformations in plain English (e.g., "make the sky more dramatic with sunset colors"), and watch AI-powered edits happen in real-time. The app maintains edit history, allows before/after comparisons, and saves edited images to a personal gallery.

## Recent Changes (November 11, 2025)

**Gemini AI Image Editing Integration - COMPLETE**
- Integrated Google Gemini 2.5 Flash Image (Nano Banana) model for AI-powered image transformations
- Implemented POST /api/edits endpoint with full image editing pipeline:
  - Downloads source image from object storage (bypassing authentication issues)
  - Converts image to base64 data URL for Gemini API
  - Calls Gemini generateContent() with multimodal input (image + text prompt)
  - Uploads edited result back to object storage with ACL policies
  - Saves edit record to database with resultUrl
- Created gemini.ts service using @google/genai SDK with generateContent multimodal approach
- Updated EditorPage to call real API endpoint and display AI-generated edits
- Error handling: Surfaces clear error messages to users when API quota is exceeded
- Edit history now displays actual AI-generated images with prompts and timestamps
- Complete flow verified: upload → prompt → AI edit → save to gallery ✓

**Comprehensive Design Enhancement**
- Enhanced visual design across entire application with elegant, cohesive styling
- **GalleryPage**: Improved typography (text-4xl headings), better spacing (max-w-6xl, gap-8), enhanced empty states
- **GalleryItem**: Added smooth hover animations (scale-110, duration-300), elegant overlay with backdrop-blur-sm
- **ImageDetailModal**: Larger layout (max-w-6xl), Sparkles icon accent, improved spacing (p-6)
- **EditHistory**: Enhanced sidebar with bg-card/50, primary-colored icons, refined empty states
- **EditHistoryItem**: Better card design with hover states, Sparkles icons, improved spacing (p-4)
- **EditorPage**: Improved workspace layout, centered content (max-w-5xl), enhanced upload state
- **PromptInput**: Larger input (min-h-24), border-2 focus states, keyboard shortcuts hint
- **PromptSuggestions**: Better visual hierarchy with primary Sparkles icon
- Fixed TypeScript errors for null checking in EditorPage and GalleryPage
- All changes follow design_guidelines.md - Inter font, consistent spacing scale, Figma/Linear-inspired polish

**Previous Changes (November 10, 2025)**

**Save Edit and Gallery Features**
- Added PUT /api/images/:id endpoint to update image's currentUrl when edits are saved
- Implemented save functionality in EditorPage - clicking save on an edit updates the image in database
- Refactored GalleryPage to fetch real user images from GET /api/images instead of mock data
- Added loading and empty states to GalleryPage for better UX
- Gallery displays all user's images with their current (latest saved) versions
- Before/after modal shows original vs current image comparison
- End-to-end tested complete flow: upload → edit → save → gallery ✓

**Image Upload Implementation**
- Added Replit Object Storage integration for secure image storage
- Implemented presigned URL upload flow (client → object storage → database)
- Created ObjectUploader component using Uppy Dashboard for modern upload UX
- Added ACL policies to enforce authentication for private images
- Implemented storage interface with full CRUD operations for images and edits
- Fixed apiRequest function call signatures in EditorPage
- Fixed Uppy CSS imports using proper package export paths
- End-to-end tested upload flow with successful image persistence and display

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript via Vite for fast development and optimized production builds
- Monorepo structure with client code organized under `client/src/`
- Wouter for lightweight client-side routing (pages: Home, Onboarding, Editor, Gallery)

**UI Component System**
- Shadcn UI component library (Radix UI primitives) for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system following "canvas-first" principle with progressive disclosure
- Custom spacing scale (2, 4, 6, 8, 12, 16, 20, 24) for consistent rhythm
- Typography: Inter (primary), JetBrains Mono (monospace for prompts)

**State Management**
- TanStack React Query for server state, caching, and data fetching
- React Context API for local/global UI state
- React hooks (useState, useEffect) for component-level state

**Key User Flows**
1. **Onboarding**: Interview flow collecting user preferences (editing style, use cases, skill level, favorite effects)
2. **Editor Workspace**: Upload → Edit with prompts → Review history → Save to gallery
3. **Gallery**: Browse saved edits with modal detail view and before/after slider

**File Upload**
- Uppy Dashboard modal for modern upload experience with progress tracking
- Direct client-side uploads to Replit Object Storage via presigned URLs
- Accepts JPEG, PNG, WebP formats with 20MB size limit
- Client-side image dimension extraction before database persistence
- ObjectUploader component wraps Uppy with configurable restrictions and callbacks

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for REST API server
- TypeScript throughout for type safety
- Vite dev server integration for seamless HMR in development

**Database Layer**
- PostgreSQL via Neon serverless database
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling via `@neondatabase/serverless` with WebSocket support
- Schema defined in `shared/schema.ts` for shared types between client and server

**Database Schema**
- `sessions` table: sid (primary key), sess (jsonb), expire (timestamp) - Required for Replit Auth
- `users` table: id (varchar UUID), email, firstName, lastName, profileImageUrl, createdAt, updatedAt
- `images` table: id (serial), userId (FK), originalUrl, currentUrl, fileName, fileSize, width, height, createdAt, updatedAt
- `edits` table: id (serial), imageId (FK), userId (FK), prompt, resultUrl, createdAt
- Foreign keys with cascade delete for data integrity
- Schema uses Drizzle's `pgTable` with type inference for full TypeScript support
- Zod validation schemas derived from Drizzle schemas via `createInsertSchema`

**Authentication**
- Designed for Replit Auth integration (authentication logic to be implemented)
- Session-based authentication with credentials included in API requests

**API Structure**
- REST endpoints prefixed with `/api`
- Request/response logging middleware for debugging
- JSON body parsing with raw body capture for webhooks
- Error handling with proper HTTP status codes

**Storage Strategy**
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based design (`IStorage`) with full CRUD operations for images and edits
- Database-backed storage using Drizzle ORM for production data persistence
- Replit Object Storage integrated for secure image file storage with ACL policies

**Image Processing & Storage**
- Presigned URL generation for secure direct-to-storage uploads (`POST /api/objects/upload`)
- ACL policy enforcement for private image access control (requires authentication)
- Path normalization to convert storage URLs to `/objects/...` format for ACL verification
- Image metadata persistence with automatic dimension extraction on client side
- AI transformations via Google Gemini 2.5 Flash Image API (fully implemented)
  - POST /api/edits endpoint handles complete edit pipeline
  - Uses multimodal generateContent() approach (image + text instruction)
  - Downloads from object storage, processes with Gemini, uploads result
  - Response time: 15-30 seconds for AI processing

### External Dependencies

**AI Integration**
- Google Gemini 2.0 Flash Image Generation API (`@google/genai` SDK v0.21+)
- Model: gemini-2.0-flash-preview-image-generation (stable release, no quota bugs)
- Method: generateContent() with multimodal input (inlineData image + text prompt)
- Config: responseModalities set to ["image"] for image output
- Natural language prompt processing for image transformations
- API key managed via GEMINI_API_KEY environment variable
- Robust error handling:
  - Quota exceeded errors (429) → User-friendly message with retry guidance
  - Invalid API key errors (401) → Configuration error message
  - Access denied errors (403) → Service unavailable message
  - All errors logged server-side with structured error responses

**Database Service**
- Neon PostgreSQL (serverless)
- Connection string stored in `DATABASE_URL` environment variable
- WebSocket connections for efficient query execution

**Development Tools**
- Replit-specific plugins for dev banner, error overlay, and cartographer
- ESBuild for production server bundling
- Drizzle Kit for database migrations (`db:push` script)

**Rate Limiting & Validation**
- Express-rate-limit for API throttling (prevents abuse)
- Joi or Zod for request validation (Zod actively used with Drizzle)

**UI Component Libraries**
- Extensive Radix UI primitives: Dialog, Dropdown, Toast, Popover, Scroll Area, etc.
- Lucide React for consistent iconography
- react-dropzone for file uploads
- Custom before/after slider implementation (not using external library despite design doc mention)

**Utilities**
- clsx + tailwind-merge for dynamic className composition
- date-fns for date formatting
- nanoid for unique ID generation