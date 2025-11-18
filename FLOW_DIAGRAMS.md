# Student Registration Flow - Visual Diagrams

## Complete Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STUDENT REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Student visits  │
│  /student-       │
│  registration    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Registration Form Component             │
│  ────────────────────────────────────    │
│  • Student Info (name, email, DOB)       │
│  • Guardian Email                        │
│  • Upload Photo (JPEG)                   │
│  • Select Courses → Total Auto-Calc     │
│  • Address, Gender (optional)            │
└────────┬─────────────────────────────────┘
         │ Submit
         ▼
┌──────────────────────────────────────────┐
│  POST /api/student-registration/checkout │
│  ────────────────────────────────────    │
│  1. Validate data (Zod)                  │
│  2. Fetch selected courses               │
│  3. Calculate total amount               │
│  4. Create StudentRegistration (PENDING) │
│  5. Create Stripe checkout session       │
└────────┬─────────────────────────────────┘
         │ Return { url }
         ▼
┌──────────────────┐
│  Redirect to     │
│  Stripe Checkout │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Student Pays with Card                  │
│  ────────────────────────                │
│  Test: 4242 4242 4242 4242              │
│  Exp: Any future date                    │
│  CVC: Any 3 digits                       │
└────────┬─────────────────────────────────┘
         │ Payment Success
         ▼
┌──────────────────────────────────────────┐
│  Stripe sends webhook to:                │
│  POST /api/stripe/webhook                │
│  ────────────────────────                │
│  Event: checkout.session.completed       │
└────────┬─────────────────────────────────┘
         │ Verify signature ✓
         ▼
┌──────────────────────────────────────────────────────────┐
│  Webhook Handler (Transaction)                           │
│  ──────────────────────────────────────────────────      │
│  1. Generate password (random 12 chars)                  │
│  2. Hash password (bcrypt, 10 rounds)                    │
│  3. Generate Student ID (STU-202500001)                  │
│  4. Create User record:                                  │
│     • email, name, phone, DOB, address                   │
│     • password (hashed)                                  │
│     • role: STUDENT                                      │
│     • profileImage: uploaded photo URL                   │
│  5. Create Student record:                               │
│     • userId → User.id                                   │
│     • studentPublicId: STU-202500001                     │
│     • parentEmail: guardian email                        │
│  6. Update StudentRegistration:                          │
│     • status: PENDING → PAID                             │
│     • studentUserId: User.id                             │
│     • studentPublicId: STU-202500001                     │
│  7. Create Enrollments:                                  │
│     • For each selected course                           │
│     • Links Student ↔ Course                             │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  Generate ID Card                                         │
│  ─────────────────────────────────────────────────────   │
│  1. Prepare assets:                                       │
│     • Fetch student photo (JPEG)                          │
│     • Generate QR code matrix                             │
│       Payload: {id, name, email}                          │
│  2. Render SVG:                                           │
│     • 960x560px dark theme card                           │
│     • Student photo (rounded corners)                     │
│     • Name, ID, Email                                     │
│     • Courses (up to 3 lines)                             │
│     • Guardian email                                      │
│     • Institute branding                                  │
│     • QR code (bottom right)                              │
│  3. Create File object:                                   │
│     • File([svg], 'STU-202500001-id-card.svg')           │
│     • type: 'image/svg+xml'                               │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Upload to UploadThing                   │
│  ────────────────────────                │
│  • UTApi.uploadFiles(file)               │
│  • Returns: { url, key }                 │
└────────┬─────────────────────────────────┘
         │ Upload success
         ▼
┌──────────────────────────────────────────┐
│  Update Database with ID Card URLs       │
│  ────────────────────────────────────    │
│  • Student.idCardUrl = url               │
│  • Student.idCardKey = key               │
│  • StudentRegistration.idCardUrl = url   │
│  • StudentRegistration.idCardKey = key   │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  Send Email (Resend)                                      │
│  ─────────────────────────────────────────────────────   │
│  To: [studentEmail, guardianEmail]                        │
│  From: admissions@zigmainstitute.lk                       │
│  Subject: "Welcome to Zigma Institute"                    │
│  ────────────────────────────────────────────────────    │
│  Content:                                                 │
│  • Welcome message                                        │
│  • LMS Credentials:                                       │
│    - Email: student@example.com                           │
│    - Password: [generated password]                       │
│  • ID Card Download Link                                  │
│  • Enrolled Courses List                                  │
│  • Contact Information                                    │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Redirect to     │
│  /student-       │
│  registration/   │
│  success         │
└──────────────────┘
```

## Dashboard Flow

```
┌──────────────────┐
│  Admin logs in   │
│  /sign-in        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Navigate to Dashboard                   │
│  /dashboard                              │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Click "Student Registration" in Sidebar │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  StudentRegistrationManagement Component                 │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Stats Cards                                     │    │
│  │  ───────────────────────────────────────────    │    │
│  │  • Total: 45 registrations                       │    │
│  │  • Awaiting Approval: 12                         │    │
│  │  • Approved: 33                                  │    │
│  │  • ID Cards Ready: 33                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Controls                                        │    │
│  │  ───────────────────────────────────────────    │    │
│  │  [Search: Name, Email, ID] [Filter: Status ▼]   │    │
│  │                                                  │    │
│  │  [Download Selected] (if any selected)          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Registrations Table                             │    │
│  │  ───────────────────────────────────────────    │    │
│  │  ☐ | ID | Name | Email | Courses | Actions     │    │
│  │  ───────────────────────────────────────────    │    │
│  │  ☑ | STU-001 | John | j@e.com | Math | 👁 📥 ✓│    │
│  │  ☑ | STU-002 | Jane | a@e.com | Sci  | 👁 📥 ✓│    │
│  │  ☐ | STU-003 | Mike | m@e.com | Eng  | 👁 📥 ✓│    │
│  │                                                  │    │
│  │  👁 = Preview details                            │    │
│  │  📥 = Download ID card                           │    │
│  │  ✓ = Approve (if status = PAID)                 │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## ID Card Download Options

```
Option 1: Single Download
──────────────────────────
Click 📥 icon → Downloads SVG file
  ↓
Opens/downloads: John-Doe-id-card.svg


Option 2: Bulk Download
──────────────────────────
1. Select multiple (☑) registrations
2. Click [Download Selected]
  ↓
POST /api/student-registration/id-cards
  ↓
Generates merged PDF with all ID cards
  ↓
Downloads: zigma-student-id-cards-2025-11-18.pdf
```

## ID Card Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Zigma Institute                               [QR]    │
│  AI-powered personalised learning...           [Code]  │
│                                                [Here]   │
│  ┌──────────┐                                          │
│  │          │   Student Name                           │
│  │  Photo   │   ─────────────                          │
│  │  260x320 │   John Doe                               │
│  │          │                                           │
│  │  JPEG    │   Student ID                             │
│  │  Rounded │   ───────────                            │
│  │  Corners │   STU-202500001                          │
│  └──────────┘                                          │
│                  Email                                  │
│                  ─────                                  │
│                  john@example.com                       │
│                                                         │
│  Guardian Email  Courses                                │
│  ───────────     ───────                                │
│  parent@e.com    Mathematics A/L,                       │
│                  Physics A/L                            │
│                                                         │
│                  Colombo Innovation Hub...              │
└─────────────────────────────────────────────────────────┘
       960px x 560px | Dark Theme | SVG/PDF
```

## QR Code Data Format

```json
{
  "id": "STU-202500001",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Scanning Result:**
```
Student ID: STU-202500001
Name: John Doe
Email: john@example.com
```

## Database Relationships

```
User
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── role = "STUDENT"
├── profileImage (photo URL)
└── ...

Student
├── userId (PK, FK → User.id)
├── studentPublicId = "STU-202500001" (UNIQUE)
├── parentEmail
├── idCardUrl
└── idCardKey

StudentRegistration
├── id (PK)
├── email
├── studentPhotoUrl
├── totalAmountInCents
├── status (PENDING → PAID → APPROVED)
├── stripeSessionId (UNIQUE)
├── studentUserId (FK → User.id)
├── studentPublicId
├── idCardUrl
└── idCardKey

Enrollment
├── id (PK)
├── studentId (FK → Student.userId)
├── courseId (FK → Course.id)
└── enrolledAt

Course
├── id (PK)
├── name
├── priceInCents
└── currency
```

## Webhook Event Timeline

```
Time    Event
─────────────────────────────────────────────────────────
00:00   Student submits form
00:01   Redirect to Stripe
00:05   Student enters payment details
00:06   Payment processed successfully
00:07   ✓ Stripe webhook triggered
00:07   ✓ Signature verified
00:08   ✓ User created (with hashed password)
00:08   ✓ Student created (STU-202500001)
00:08   ✓ Registration updated (PENDING → PAID)
00:09   ✓ Enrollments created (3 courses)
00:10   ✓ ID card generated (SVG rendered)
00:12   ✓ ID card uploaded to UploadThing
00:12   ✓ Database updated with card URLs
00:15   ✓ Email sent to student & guardian
00:15   ✓ Webhook completed successfully
00:16   Student receives email
```

## Error Handling Flow

```
┌──────────────────┐
│  Webhook Event   │
└────────┬─────────┘
         │
         ▼
    Verify Signature
         │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Return 400 "Invalid signature"
    │
    ▼
Find Registration
    │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Log warning, Return 200
    │
    ▼
Check Existing User
    │
    ┌────┴────┐
    │         │
   NEW       EXISTS
    │         │
    │         └──> Set status FAILED, Log error, Return 200
    │
    ▼
Start Transaction
    │
    ├──> Create User
    ├──> Create Student
    ├──> Create Enrollments
    └──> Update Registration
         │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Rollback, Throw error, Return 500
    │
    ▼
Generate ID Card
    │
    ├──> Fetch photo
    ├──> Generate QR
    └──> Render SVG
         │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Log error, Throw, Return 500
    │
    ▼
Upload to UploadThing
    │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Log error, Throw, Return 500
    │
    ▼
Update with URLs
    │
    ▼
Send Email
    │
    ┌────┴────┐
    │         │
   ✓OK       ✗FAIL
    │         │
    │         └──> Log error (but don't fail)
    │
    ▼
   Return 200
   "Success"
```

---

**Last Updated:** 2025-11-18  
**Version:** 1.0.0
