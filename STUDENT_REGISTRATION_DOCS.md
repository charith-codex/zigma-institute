# Student Registration Flow - Implementation Documentation

## Overview
The Zigma Institute student registration system provides a complete end-to-end flow for online student registration with automated payment processing, ID card generation, and account provisioning.

## Architecture

### Flow Diagram
```
Student Registration Form → Stripe Checkout → Payment Success Webhook → Student Onboarding
                                                      ↓
                            Create User → Generate ID → Create ID Card → Upload to UploadThing → Send Email
```

## Components

### 1. Registration Form
**Location:** `/app/(root)/student-registration/page.tsx`
**Component:** `StudentRegistrationForm`

**Features:**
- Student information collection (name, DOB, email, phone, address, gender)
- Guardian email capture
- Course selection with pricing display
- Student photo upload (JPEG, max 4MB)
- Real-time total calculation
- Form validation with Zod

**Fields:**
- `name`: Student's full name (required)
- `dateOfBirth`: Date of birth (required)
- `email`: Student email (required)
- `phone`: Contact number (required)
- `address`: Postal address (optional)
- `gender`: Male/Female (optional)
- `guardianEmail`: Parent/guardian email (required)
- `courses`: Array of course IDs (minimum 1 required)
- `studentPhoto`: Uploaded photo URL and key (required)

### 2. Stripe Integration

#### Checkout Endpoint
**Location:** `/app/api/student-registration/checkout/route.ts`

**Process:**
1. Validates registration data
2. Fetches selected courses from database
3. Calculates total amount
4. Creates `StudentRegistration` record with PENDING status
5. Creates Stripe checkout session
6. Returns checkout URL for redirect

**Environment Variables Required:**
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

#### Webhook Handler
**Location:** `/app/api/stripe/webhook/route.ts`

**Process:**
1. Verifies Stripe webhook signature
2. Handles `checkout.session.completed` event
3. Creates User and Student records
4. Generates unique student ID (STU-YYYY#####)
5. Generates ID card with QR code
6. Uploads ID card to UploadThing
7. Enrolls student in selected courses
8. Sends onboarding email

**Environment Variables Required:**
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret
- `UPLOADTHING_TOKEN`: UploadThing API token

### 3. Student ID Generation

#### ID Format
**Pattern:** `STU-{YEAR}{SEQUENTIAL_NUMBER}`
**Example:** `STU-202500001`

**Logic:** `/lib/student-registration/identifiers.ts`
- Year: Current year (4 digits)
- Sequential: 5-digit zero-padded number
- Starts from 00001 for each year
- Auto-increments based on existing records

### 4. ID Card Generation

#### Components Used:
- **QR Code Generator:** `/lib/student-registration/qr.ts`
- **ID Card Renderer:** `/lib/student-registration/id-card.ts`

#### ID Card Features:
- **Format:** SVG (for single cards), PDF (for bulk)
- **Dimensions:** 960x560 pixels
- **Elements:**
  - Institute name and tagline
  - Student photo (JPEG, clipped with rounded corners)
  - Student name
  - Student ID
  - Email address
  - Enrolled courses (up to 3 lines)
  - Guardian email
  - QR code with encoded student data
  - Modern dark theme design

#### QR Code Payload:
```json
{
  "id": "STU-202500001",
  "name": "Student Name",
  "email": "student@example.com"
}
```

### 5. File Upload (UploadThing)

**Configuration:** `/app/api/uploadthing/core.ts`

**Endpoints:**
- `studentRegistrationPhoto`: Photo upload during registration (JPEG only, 4MB max)
- Used by UTApi for ID card upload (SVG/PDF)

**Environment Variables:**
- `UPLOADTHING_TOKEN`: API token for server-side uploads

### 6. Email Notifications

**Service:** Resend
**Template:** `/email/student-onboarding.tsx`

**Email Contents:**
- Welcome message
- LMS login credentials (email + temporary password)
- Link to download ID card
- List of enrolled courses
- Contact information

**Recipients:**
- Student email
- Guardian email

**Environment Variables:**
- `RESEND_API_KEY`: Resend API key
- `SENDER_EMAIL`: From email address (e.g., admissions@zigmainstitute.lk)

### 7. Dashboard Management

**Location:** `/components/eims/StudentRegistrationManagement.tsx`

**Features:**
- View all paid/approved registrations
- Search by name, email, or student ID
- Filter by status (PAID, APPROVED)
- Approve/reject registrations
- Download individual ID cards
- Bulk PDF generation for selected ID cards
- Preview registration details

**Access Control:**
- Requires authentication
- ADMIN or MANAGER role only

## Database Schema

### StudentRegistration Table
```prisma
model StudentRegistration {
  id                 String                    @id @default(uuid())
  name               String
  email              String
  phone              String
  address            String?
  gender             Gender?
  dateOfBirth        DateTime
  guardianEmail      String
  studentPhotoUrl    String
  studentPhotoKey    String
  totalAmountInCents Int
  currency           String                    @default("usd")
  status             StudentRegistrationStatus @default(PENDING)
  stripeSessionId    String?                   @unique
  studentUserId      String?                   @unique
  studentPublicId    String?
  idCardUrl          String?
  idCardKey          String?
  createdAt          DateTime                  @default(now())
  updatedAt          DateTime                  @updatedAt
  
  student Student?                    @relation(...)
  courses StudentRegistrationCourse[]
}

enum StudentRegistrationStatus {
  PENDING
  PAID
  APPROVED
  FAILED
}
```

### Student Table
```prisma
model Student {
  userId          String  @id
  studentPublicId String? @unique
  parentEmail     String?
  idCardUrl       String?
  idCardKey       String?
  
  user         User                 @relation(...)
  registration StudentRegistration? @relation(...)
  enrollments  Enrollment[]
}
```

## API Endpoints

### POST /api/student-registration/checkout
**Purpose:** Create Stripe checkout session
**Body:**
```json
{
  "name": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "email": "string",
  "phone": "string",
  "address": "string?",
  "gender": "MALE|FEMALE?",
  "guardianEmail": "string",
  "courses": ["courseId1", "courseId2"],
  "studentPhoto": {
    "url": "string",
    "key": "string"
  }
}
```
**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### GET /api/student-registration
**Purpose:** Fetch registrations by status
**Query Params:** `?status=PAID&status=APPROVED`
**Response:** Array of StudentRegistration objects

### PATCH /api/student-registration
**Purpose:** Update registration status
**Body:**
```json
{
  "id": "registration-id",
  "status": "APPROVED|FAILED"
}
```

### POST /api/student-registration/id-cards
**Purpose:** Generate bulk PDF of ID cards
**Body:**
```json
{
  "ids": ["reg-id-1", "reg-id-2"]
}
```
**Response:** PDF file download

### POST /api/stripe/webhook
**Purpose:** Handle Stripe payment events
**Headers:** `stripe-signature` (required)
**Body:** Stripe event payload

## Environment Configuration

### Required Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing
UPLOADTHING_TOKEN="ut_..."

# Email
RESEND_API_KEY="re_..."
SENDER_EMAIL="admissions@zigmainstitute.lk"

# Application
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

## Security Considerations

1. **Webhook Verification:** All Stripe webhooks are verified using signature
2. **Password Security:** Temporary passwords are hashed with bcrypt (10 rounds)
3. **File Upload Validation:** Only JPEG images accepted for student photos
4. **Authentication:** Dashboard routes require valid session
5. **Authorization:** Only ADMIN/MANAGER roles can access management dashboard

## Testing Checklist

- [ ] Registration form validation works correctly
- [ ] Course selection updates total price
- [ ] Student photo upload accepts JPEG only
- [ ] Stripe checkout redirects correctly
- [ ] Webhook receives payment events
- [ ] Student ID is generated correctly (STU-YYYY#####)
- [ ] ID card is generated with all required fields
- [ ] ID card is uploaded to UploadThing successfully
- [ ] User and Student records are created
- [ ] Student is enrolled in selected courses
- [ ] Email is sent to both student and guardian
- [ ] Dashboard shows new registrations
- [ ] Single ID card download works
- [ ] Bulk PDF generation works
- [ ] Approve/reject functionality works

## Known Issues & Solutions

### Issue: ID Card Upload Fails
**Symptom:** Webhook completes but no ID card URL in database
**Cause:** Incorrect File object construction
**Solution:** ✅ Fixed - Removed redundant Blob wrapper

### Issue: Email Not Received
**Symptom:** Registration completes but no email
**Possible Causes:**
1. Invalid RESEND_API_KEY
2. SENDER_EMAIL not verified in Resend
3. Email in spam folder
**Solution:** Check Resend dashboard for delivery status

### Issue: Webhook Not Triggered
**Symptom:** Payment succeeds but student not created
**Possible Causes:**
1. Webhook endpoint not configured in Stripe
2. Invalid STRIPE_WEBHOOK_SECRET
**Solution:** 
1. Add webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/stripe/webhook`
2. Listen for event: `checkout.session.completed`
3. Copy webhook secret to .env

## Maintenance

### Adding New Courses
Courses are automatically fetched from the database. Add new courses via the Course Management interface.

### Customizing ID Card Design
Edit `/lib/student-registration/id-card.ts`:
- Modify `CARD_WIDTH`, `CARD_HEIGHT` constants for dimensions
- Update SVG/PDF rendering functions for layout changes
- Change colors in the design constants

### Customizing Email Template
Edit `/email/student-onboarding.tsx`:
- Modify Tailwind classes for styling
- Update text content
- Add/remove sections as needed

## Support

For issues or questions:
- Email: admissions@zigmainstitute.lk
- Phone: +94 11 222 3344

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
