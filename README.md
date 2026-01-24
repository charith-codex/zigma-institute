# Zigma Institute Platform

A comprehensive education management platform built with Next.js 15, Prisma ORM, and modern web technologies. The platform integrates multiple surfaces including public marketing, student learning management, teacher content management, and administrative systems into a unified experience.

## Platform Overview

Zigma Institute is a multi-tenant educational platform designed to handle the complete lifecycle of student education—from marketing and enrollment through course delivery, assessment, and performance tracking. Built with the Next.js App Router and server components, it delivers high performance while maintaining clean separation of concerns across different user roles.

### Core Surfaces

- **Marketing Site** (`/`) – Public-facing course catalog, contact forms, gallery, and student registration
- **LMS** (`/lms`) – Student learning portal with enrolled courses, exam taking, performance dashboards, and AI study tools
- **CMS** (`/lms-cms`) – Teacher/staff content management for courses, lessons, exams, grading, and student analytics
- **EIMS** (`/dashboard`) – Admin dashboards for student registrations, payments, scheduling, and institutional management
- **Auth System** – NextAuth-based authentication with role-based access control (Student, Teacher, Staff, Admin, Manager)

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Actions, Prisma ORM
- **Database**: PostgreSQL (Neon adapter)
- **Auth**: NextAuth.js with Prisma adapter
- **Payments**: Stripe with webhooks
- **File Uploads**: UploadThing
- **Email**: Resend with React Email templates
- **AI/Chatbot**: OpenAI integration for study assistance and content generation

## Key Features

### Student Registration & Onboarding

- **Online Registration** – Photo upload, course selection, and Stripe payment processing at `/student-registration`
- **Automated Onboarding** – Creates student accounts, generates ID cards with QR codes, sends credentials via email
- **Staff Review** – Approve/reject registrations, download ID cards (individual or batch PDFs) at `/dashboard`
- **Flexible ID Generation** – Auto-generated after payment, on approval, or manually via regenerate button

### Learning Management (LMS)

- **Course Enrollment** – Browse and enroll in available courses
- **Online Exams** – Timed exams with MCQ and essay questions, auto-grading, teacher review
- **Exam Marks** – View physical and online exam results by course
- **Performance Analytics** – Track progress, course averages, and performance trends
- **Study Materials** – Access course content, video recordings, and downloadable resources
- **AI Study Tools** – Chatbot assistance for learning support
- **Attendance Tracking** – View attendance records and notifications
- **Payment Management** – Track tuition payments and invoices

### Content Management (CMS)

- **Course Builder** – Create and manage courses, lessons, and schedules
- **Exam Builder** – Build exams from question banks with configurable marks and time limits
- **Question Bank** – Create MCQ and essay questions with difficulty levels
- **Exam Grading** – Grade essay questions, provide feedback, auto-calculate scores
- **Physical Exam Upload** – Upload scanned exam papers with marks for offline assessments
- **Student Analytics** – View individual student performance and attendance
- **Exam Scheduler** – Publish/close exams, schedule exam sessions
- **AI Content Generation** – Generate exam papers and questions using AI

### Administrative (EIMS)

- **Registration Management** – Review student applications, approve/reject, generate ID cards
- **Payment Tracking** – Monitor payment transactions and Stripe integration
- **Student Management** – Full student database with profiles and registration history
- **Course Categories** – Organize courses by category and manage catalog
- **Scheduling** – Manage class schedules and timetables
- **User Management** – Create and manage staff, teacher, and admin accounts
- **Showcase Gallery** – Highlight top-performing students (Island/District rankings)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env` and configure):
   - `DATABASE_URL` - PostgreSQL connection
   - `NEXTAUTH_SECRET` - Auth secret (generate with `openssl rand -hex 32`)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe credentials
   - `UPLOADTHING_TOKEN` - For file uploads
   - `RESEND_API_KEY`, `SENDER_EMAIL` - For emails

3. Set up database:

```bash
npx prisma migrate deploy
```

4. Start development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Student Registration Flow

### For Students

1. Visit `/student-registration`
2. Fill form with personal details and upload photo
3. Select courses (prices auto-calculated)
4. Complete Stripe payment
5. Receive email with login credentials and ID card

### For Staff

1. Login to dashboard
2. Navigate to "Student Registration" section
3. View pending registrations (PAID status)
4. Review details and approve/reject
5. Download ID cards individually or in batch
6. If ID card missing, click regenerate button

## ID Card Generation

ID cards are automatically generated in three scenarios:

1. **After Payment** (Primary) - Webhook generates ID card when payment succeeds
2. **On Approval** (Fallback) - If ID card missing, generated when staff approves
3. **Manual** (Override) - Staff can regenerate using the refresh button in dashboard

## Stripe Webhook Setup

For local development:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

For production, configure webhook endpoint in Stripe Dashboard:

- URL: `https://yourdomain.com/api/stripe/webhook`
- Event: `checkout.session.completed`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Project Structure

```
app/
├── (root)/                          # Public marketing site
│   ├── page.tsx                     # Homepage
│   ├── about/                       # About page
│   ├── contact/                     # Contact form
│   ├── courses/                     # Course catalog
│   ├── gallery/                     # Photo gallery
│   └── student-registration/        # Public registration form
├── (lms)/                           # Student learning portal
│   └── lms/
│       ├── page.tsx                 # LMS dashboard
│       ├── exams/[examId]/          # Exam taking interface
│       └── [other student pages]    # Courses, marks, performance, etc.
├── (cms)/                           # Teacher/staff content management
│   └── lms-cms/
│       └── courses/[courseId]/      # Course management, exams, grading
├── (eims)/                          # Admin dashboards
│   └── dashboard/
│       ├── student-registration/    # Registration approval
│       ├── students/                # Student management
│       ├── payments/                # Payment tracking
│       └── [other admin pages]      # Scheduling, users, etc.
├── (auth)/                          # Authentication pages
│   ├── sign-in/
│   ├── forgot-password/
│   └── reset-password/
└── api/                             # API routes & server actions
    ├── stripe/webhook/              # Payment webhook handler
    ├── student-registration/        # Registration APIs
    ├── exams/                       # Exam management
    ├── exam-attempts/               # Exam submissions & grading
    ├── courses/                     # Course APIs
    └── [other endpoints]/

components/
├── lms/                             # LMS student components
│   ├── ExamMarksDisplay.tsx
│   ├── StudentPerformance.tsx
│   └── [other LMS components]
├── cms/                             # CMS teacher components
│   ├── ExamBuilder.tsx
│   ├── ExamResults.tsx
│   ├── PhysicalExamUploader.tsx
│   └── [other CMS components]
├── eims/                            # EIMS admin components
│   ├── StudentRegistrationManagement.tsx
│   └── [other admin components]
├── marketing/                       # Public site components
├── ui/                              # Reusable UI components (shadcn/ui)
└── providers/                       # Context providers

lib/
├── actions/                         # Server actions
│   ├── student-performance.ts
│   ├── course-analytics.ts
│   ├── physical-exam.ts
│   └── [other actions]
├── student-registration/            # Registration utilities
│   ├── generate-id-card.ts          # ID card generator
│   ├── id-card.ts                   # SVG/PDF renderer
│   ├── identifiers.ts               # Student ID generator (STU-YYYY#####)
│   ├── password.ts                  # Password generator
│   └── qr.ts                        # QR code generator
├── validators/                      # Zod schemas
├── constants/                       # App constants
├── payments.ts                      # Stripe utilities
└── utils.ts                         # Shared utilities

prisma/
├── schema.prisma                    # Database schema
└── migrations/                      # Database migrations

email/                               # React Email templates
├── student-onboarding.tsx
├── payment-invoice.tsx
├── attendance-notification.tsx
└── [other email templates]
```

## Architecture & Design Patterns

### Route Groups

The app uses Next.js route groups to organize pages by surface while sharing layouts:

- `(root)` – Public marketing with Header/Footer
- `(lms)` – Student portal with LMS sidebar (pt-14 spacing)
- `(cms)` – Teacher CMS with CMS sidebar
- `(eims)` – Admin dashboards with EIMS sidebar (pt-18 spacing)
- `(auth)` – Minimal auth pages without navigation

Each route group owns its layout with appropriate `SessionProvider`, `SidebarProvider`, and themed chrome.

### Data Layer

- **Prisma Client** – Centralized in `db/prisma.ts` with Neon adapter, memoized to prevent connection leaks
- **Server Actions** – Colocated with features in `app/actions` and `lib/actions`, marked with `"use server"`
- **API Routes** – REST endpoints in `app/api` for external integrations (Stripe webhooks, file uploads)
- **Type Safety** – Generated Prisma types from `lib/generated/prisma`, custom types in `types/`

### Authentication & Authorization

- **NextAuth.js** – Configured in `auth.ts` with Prisma adapter and credentials provider
- **Session Management** – Server components use `auth()`, client components use `useSession()`
- **Role-Based Access** – `UserRole` enum (STUDENT, TEACHER, STAFF, ADMIN, MANAGER) gates UI and API access
- **Auth Guards** – Middleware and server-side checks in `lib/auth-guards.ts`

### State Management

- **Server State** – React Server Components fetch data directly via Prisma
- **Client State** – React hooks (`useState`, `useEffect`) for interactive UI
- **Global State** – Context providers in `components/providers/` (notifications, themes, sessions)
- **Form State** – React Hook Form with Zod validation

### Styling

- **Tailwind CSS v4** – Utility-first styling with custom design tokens
- **shadcn/ui** – Accessible component primitives in `components/ui/`
- **Dark Mode** – next-themes integration with system preference support
- **Utilities** – `cn()` helper for conditional classes, `formatCurrency()` for money formatting

## Testing

### Student Registration Flow

Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)

Verify:

1. ✅ Payment succeeds and creates student record
2. ✅ Email sent to both student and guardian
3. ✅ ID card visible in dashboard
4. ✅ Student can login with provided credentials
5. ✅ Approval generates missing ID cards
6. ✅ Manual regeneration works

### End-to-End Workflows

**Student Learning Journey**

1. Register and pay → Receive credentials
2. Login to LMS → View enrolled courses
3. Access study materials and lessons
4. Take online exams → Submit answers
5. View exam marks after teacher grading
6. Track performance across courses

**Teacher Content Management**

1. Login to CMS → Select course
2. Create lessons and upload materials
3. Build exams from question bank
4. Publish exam and schedule
5. Grade student submissions
6. Upload physical exam marks
7. View course analytics

**Admin Operations**

1. Review student registrations
2. Approve/reject applications
3. Download ID cards (individual/batch)
4. Monitor payment transactions
5. Manage users and permissions
6. Generate reports and analytics

## Development Notes

### Important Conventions

- **Server Components by Default** – Add `"use client"` only when using hooks or browser APIs
- **Server Actions** – Always mark with `"use server"` directive, keep data validation nearby
- **File Uploads** – Use UploadThing helpers in `lib/uploadthing.ts`
- **Payments** – Extend `lib/payments.ts` and `lib/stripe.ts` instead of calling SDKs directly
- **Email Sending** – Use React Email templates in `email/` directory, send via Resend helpers in `email/index.tsx`
- **Notifications** – Use `NotificationProvider` context backed by `app/actions/notifications.ts`

### Common Gotchas

- Sidebar spacing differs: LMS uses `pt-14`, EIMS uses `pt-18`
- Many components are server-first—avoid unnecessary client boundaries
- Prisma client is memoized in `db/prisma.ts`—never instantiate elsewhere
- When updating Prisma models, audit dependent server actions and dashboard components
- Student IDs can be user UUID or public ID (STU-YYYY#####)—query both when looking up exam attempts
- Email/SMS sending is async in server actions—log errors but don't throw

### Scripts

```bash
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run start         # Serve production build
npm run lint          # Run ESLint
npx prisma migrate deploy    # Apply migrations
npx prisma generate          # Generate Prisma client
npx prisma studio            # Open Prisma Studio GUI
```

## Deployment

### Environment Variables

refer .env.example file

### Database Setup

1. Provision PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. Run migrations: `npx prisma migrate deploy`
3. Seed initial data if needed: `npx prisma db seed`

### Stripe Configuration

1. Create webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
2. Subscribe to `checkout.session.completed` event
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
