# Student Registration Testing Guide

## Prerequisites

1. **Stripe Account Setup**
   - Create a Stripe account at https://stripe.com
   - Get test API keys from Dashboard
   - Set up webhook endpoint

2. **UploadThing Account**
   - Create account at https://uploadthing.com
   - Get API token from dashboard

3. **Resend Account**
   - Create account at https://resend.com
   - Verify sender email
   - Get API key

4. **Database**
   - PostgreSQL database (local or hosted)
   - Run migrations: `npx prisma migrate deploy`

## Environment Setup

Create `.env` file with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zigma"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing
UPLOADTHING_TOKEN="eyJhcGlL..."

# Resend
RESEND_API_KEY="re_..."
SENDER_EMAIL="admissions@zigmainstitute.lk"

# App
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Zigma Institute"
```

## Stripe Webhook Setup

### Option 1: Stripe CLI (Local Testing)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (whsec_...) to .env as STRIPE_WEBHOOK_SECRET
```

### Option 2: Production/Staging
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret to .env

## Database Seeding

1. **Create Test Courses**
```typescript
// Run in Prisma Studio or create via dashboard
{
  name: "Mathematics A/L",
  slug: "mathematics-al",
  coverImage: "https://via.placeholder.com/300",
  description: "Advanced Level Mathematics",
  teacherName: "Mr. Silva",
  priceInCents: 15000, // LKR 150.00
  currency: "lkr"
}
```

2. **Create Admin User** (for dashboard access)
```bash
# Use the User Management in dashboard or seed script
# Role: ADMIN
# Email: admin@zigmainstitute.lk
```

## Testing Steps

### 1. Test Registration Form

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/student-registration`
3. Fill in all required fields:
   - Student name
   - Date of birth
   - Email (use test email)
   - Phone number
   - Guardian email
   - Upload student photo (JPEG only)
   - Select at least one course
4. Verify total amount is calculated correctly
5. Click "Proceed to payment"

**Expected:** Redirect to Stripe Checkout page

### 2. Test Stripe Payment

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Enter any future expiry date (e.g., 12/34)
3. Enter any 3-digit CVC (e.g., 123)
4. Enter any billing details
5. Click "Pay"

**Expected:** 
- Redirect to success page
- See confirmation message

### 3. Verify Webhook Processing

Check server logs for:
```
Student <email> onboarded successfully
```

Check database:
- New User record created
- New Student record with studentPublicId (STU-202500001)
- StudentRegistration status changed to PAID
- Enrollment records created
- ID card URL populated

### 4. Verify Email Delivery

Check both student and guardian email inboxes for:
- Subject: "Welcome to Zigma Institute"
- Contains: Login credentials (email + temporary password)
- Contains: ID card download link
- Contains: List of enrolled courses

**Note:** Check spam folder if not in inbox

### 5. Test Dashboard Access

1. Sign in as admin: `http://localhost:3000/sign-in`
2. Navigate to Dashboard
3. Click on "Student Registration" in sidebar
4. Verify:
   - Registration appears in list
   - Status shows as "Awaiting approval" or "Approved"
   - Student ID is displayed
   - Can download ID card
   - Can select multiple and download bulk PDF

### 6. Test ID Card

1. Click download icon for single ID card
2. Verify ID card contains:
   - Institute name and tagline
   - Student photo
   - Student name
   - Student ID (STU-202500001)
   - Email address
   - Enrolled courses
   - Guardian email
   - QR code (bottom right)

3. Test bulk download:
   - Select 2+ registrations
   - Click "Download selected"
   - Verify PDF opens with all cards

### 7. Test QR Code

1. Scan QR code with phone
2. Verify decoded data matches:
```json
{
  "id": "STU-202500001",
  "name": "Student Name",
  "email": "student@example.com"
}
```

## Troubleshooting

### Issue: Checkout fails with "Stripe not configured"
**Solution:** Verify STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are set

### Issue: Webhook not triggered
**Solution:** 
1. Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Check webhook secret matches in .env
3. Check server logs for webhook errors

### Issue: ID card not generated
**Solution:**
1. Check UPLOADTHING_TOKEN is valid
2. Check server logs for upload errors
3. Verify student photo was uploaded successfully

### Issue: Email not sent
**Solution:**
1. Verify RESEND_API_KEY is valid
2. Check SENDER_EMAIL is verified in Resend dashboard
3. Check Resend logs for delivery status

### Issue: Student photo upload fails
**Solution:**
1. Verify file is JPEG format
2. Check file size is under 4MB
3. Verify UPLOADTHING_TOKEN is set

## Test Scenarios

### Scenario 1: Single Course Registration
- Select 1 course
- Complete payment
- Verify email received
- Check ID card shows 1 course

### Scenario 2: Multiple Course Registration
- Select 3+ courses
- Verify total is sum of all courses
- Complete payment
- Verify ID card shows all courses (or truncates properly)

### Scenario 3: Bulk ID Card Download
- Create 3+ test registrations
- Select all in dashboard
- Download bulk PDF
- Verify PDF contains all ID cards

### Scenario 4: Failed Payment
- Use decline card: 4000 0000 0000 0002
- Verify student is NOT created
- Verify no email sent
- Verify registration status stays PENDING

## Performance Benchmarks

- Registration form load: < 2s
- Stripe checkout redirect: < 3s
- Webhook processing: < 10s
- ID card generation: < 5s
- Email delivery: < 30s (depends on Resend)
- Dashboard load: < 2s

## Security Testing

1. **Test authentication:**
   - Try accessing `/dashboard` without login → should redirect to sign-in
   
2. **Test authorization:**
   - Sign in as STUDENT role
   - Try accessing `/dashboard/student-registration` → should redirect to home

3. **Test webhook signature:**
   - Send POST to `/api/stripe/webhook` without signature → should return 400

4. **Test file upload limits:**
   - Try uploading 10MB file → should fail
   - Try uploading PNG file → should fail (JPEG only)

## Clean Up

After testing, clean up test data:

```sql
-- Delete test registrations
DELETE FROM "StudentRegistration" WHERE email LIKE '%test%';

-- Delete test students
DELETE FROM "Student" WHERE "userId" IN (
  SELECT id FROM "User" WHERE email LIKE '%test%'
);

-- Delete test users
DELETE FROM "User" WHERE email LIKE '%test%';
```

## Next Steps After Testing

1. ✅ Update environment variables with production values
2. ✅ Configure production webhook endpoint in Stripe
3. ✅ Verify sender email in Resend for production domain
4. ✅ Test with real course data
5. ✅ Train admissions team on dashboard usage
6. ✅ Set up monitoring for webhook failures
7. ✅ Configure backup email delivery mechanism

---

**Need Help?**
- Check logs in terminal where dev server is running
- Check Stripe Dashboard → Events for webhook delivery
- Check Resend Dashboard → Logs for email delivery
- Check UploadThing Dashboard for file uploads
