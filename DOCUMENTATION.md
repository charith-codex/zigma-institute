# Zigma Institute Platform Documentation

## 1. Project Overview

The Zigma Institute Platform is a comprehensive Education Management System designed to handle various aspects of an educational institution. It integrates Learning Management System (LMS), Content Management System (CMS), and Education Institute Management System (EIMS) capabilities into a single unified platform.

Key functionalities include:
- **Student Registration**: Seamless online registration process with payment integration.
- **Course Management**: Creation and management of courses, lessons, and materials.
- **Student Management**: Tracking student enrollments, attendance, and performance.
- **Staff Dashboard**: A dedicated interface for staff to manage registrations, approvals, and ID cards.
- **Automated Workflows**: Automatic generation of student accounts, ID cards, and email notifications upon registration.

## 2. Architecture & Tech Stack

The project is built using a modern full-stack web development architecture:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS with [shadcn/ui](https://ui.shadcn.com/) components
- **Authentication**: NextAuth.js (v5 beta)
- **Payments**: Stripe
- **Email**: Resend
- **File Uploads**: UploadThing
- **State Management**: React Server Components & Server Actions

## 3. Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Resend account
- UploadThing account

### Step-by-Step Guide

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd zigma-institute
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Copy `.env.example` to `.env` and fill in the required values:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/db"
    NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -hex 32

    # Stripe
    STRIPE_SECRET_KEY="sk_test_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

    # UploadThing
    UPLOADTHING_TOKEN="your-token"

    # Resend
    RESEND_API_KEY="re_..."
    SENDER_EMAIL="onboarding@resend.dev"
    ```

4.  **Database Setup**
    Initialize the database schema:
    ```bash
    npx prisma migrate deploy
    ```

    (Optional) Seed the database with initial data:
    ```bash
    npx tsx ./db/seed/seed.ts
    ```

5.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 4. Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

### Core User Models
- **User**: The central authentication entity. Roles include STUDENT, TEACHER, ADMIN, MANAGER, ATTENDANCE.
- **Student**: Profile data for students, linked to `User`.
- **Teacher**: Profile data for teachers, linked to `User`.
- **Staff**: Profile data for staff members, linked to `User`.

### Academic Models
- **Course**: Represents a subject or class (e.g., "Mathematics 2024").
- **Lesson**: Units of content within a course.
- **StudyMaterial**: Files/resources attached to lessons.
- **VideoRecording**: Recorded lectures.
- **ExamPaper**: Assessments linked to courses.
- **Question**: Questions (MCQ/Essay) for exams.

### Registration & Finance
- **StudentRegistration**: Temporary record created during public registration. Tracks payment and approval status.
- **PaymentTransaction**: Records of payments (Registration fees, Installments).
- **Enrollment**: Links a `Student` to a `Course`.

### System
- **Notification**: System-wide notifications.
- **Inquiry**: Contact form submissions.

## 5. Project Structure

```
app/
├── (auth)/                 # Authentication routes (signin, forgot-password)
├── (cms)/                  # Content Management System (Admin/Teacher)
├── (eims)/                 # Education Institute Management (Staff Dashboard)
├── (lms)/                  # Learning Management System (Student Dashboard)
├── (root)/                 # Public facing pages (Landing, Registration)
├── api/                    # API Route Handlers
├── layout.tsx              # Root layout
└── page.tsx                # Home page

components/
├── ui/                     # Reusable UI components (buttons, inputs)
├── shared/                 # Shared components across different apps
├── eims/                   # Components specific to EIMS
└── ...

lib/
├── prisma.ts               # Prisma client instance
├── utils.ts                # Utility functions
├── validators.ts           # Zod schemas for validation
└── student-registration/   # Logic for registration, ID cards, QR codes

prisma/
└── schema.prisma           # Database schema definition
```

## 6. Key Features & Workflows

### Student Registration Flow
1.  **Public Access**: Users visit `/student-registration`.
2.  **Form Submission**: Users provide personal details, upload a photo, and select courses.
3.  **Payment**: Integrated Stripe checkout for course fees.
4.  **Processing**:
    - Upon successful payment, a `StudentRegistration` record is marked as `PAID`.
    - A webhook triggers creation of a `User` and `Student` record.
    - An ID card is generated (PDF with QR code).
    - Email credentials are sent to the student.
5.  **Staff Approval**: Staff can view registrations in the EIMS dashboard to verify details.

### EIMS Dashboard (Staff)
Located at `/dashboard` (for authorized roles).
- **Student Registration**: View, approve, and manage student intakes.
- **ID Card Management**: Generate and download student ID cards.
- **Payments**: View transaction history.

### LMS (Students)
Located at `/lms`.
- **My Courses**: View enrolled courses.
- **Lessons & Materials**: Access study content and videos.
- **Exams**: Take online assessments.

## 7. API Reference

The application exposes several API endpoints for internal use and webhooks.

### Student Registration
- `GET /api/student-registration`: List registrations (supports filtering by status).
- `PATCH /api/student-registration`: Update registration status (e.g., Approve).
- `POST /api/student-registration/checkout`: Create a Stripe checkout session.

### Courses
- `GET /api/courses`: List all available courses.
- `POST /api/courses`: Create a new course (Admin/Teacher only).

### Webhooks
- `POST /api/stripe/webhook`: Handles Stripe events (`checkout.session.completed`) to finalize registrations.

## 8. Deployment

The application is optimized for deployment on Vercel.

1.  **Push to GitHub**: Ensure your code is in a remote repository.
2.  **Import to Vercel**: Connect your repository.
3.  **Configure Environment Variables**: Add all variables from `.env` to the Vercel project settings.
4.  **Build Command**: `next build` (default).
5.  **Install Command**: `npm install` (default).
6.  **Deploy**: Vercel will automatically build and deploy.

For the database, ensure your PostgreSQL provider allows external connections or is in the same VPC/network if using Vercel Postgres.
