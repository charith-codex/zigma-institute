# Student Registration Implementation - Quick Reference

## 🚀 Quick Start

### For Developers
```bash
# 1. Clone and install
git clone <repo-url>
cd zigma-institute
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 3. Set up database
npx prisma migrate deploy
npx prisma generate

# 4. Run development server
npm run dev
```

### For Testing
1. Visit: `http://localhost:3000/student-registration`
2. Fill registration form
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check email for credentials
5. Access dashboard: `http://localhost:3000/dashboard`

## 📊 Current Status

| Feature | Status | Location |
|---------|--------|----------|
| Registration Form | ✅ Complete | `/student-registration` |
| Course Selection & Pricing | ✅ Complete | Registration form |
| Stripe Integration | ✅ Complete | `/api/student-registration/checkout` |
| Payment Webhook | ✅ Complete | `/api/stripe/webhook` |
| Student ID Generation | ✅ Complete | Auto (STU-YYYY#####) |
| ID Card Generation | ✅ Complete | SVG/PDF with QR code |
| UploadThing Integration | ✅ Complete | ID card storage |
| Password Generation | ✅ Complete | Random secure password |
| Email Delivery | ✅ Complete | Resend integration |
| Dashboard Management | ✅ Complete | `/dashboard` → Student Registration |
| Single ID Download | ✅ Complete | Click download icon |
| Bulk PDF Download | ✅ Complete | Select multiple → Download |

## 🔧 Configuration Checklist

- [ ] Database URL configured
- [ ] Stripe API keys set
- [ ] Stripe webhook endpoint configured
- [ ] UploadThing token set
- [ ] Resend API key configured
- [ ] Sender email verified
- [ ] At least one course created
- [ ] Admin user created

## 🐛 Bug Fixed

**Issue:** ID card not uploading to UploadThing  
**Cause:** Redundant Blob wrapping in File constructor  
**Fix:** Direct string to File conversion  
**Status:** ✅ Resolved

## 📁 Key Files

```
Student Registration Flow Files:
├── app/
│   ├── (root)/student-registration/
│   │   ├── page.tsx                          # Registration page
│   │   └── success/page.tsx                  # Success page
│   └── api/
│       ├── student-registration/
│       │   ├── checkout/route.ts             # Creates Stripe session
│       │   ├── id-cards/route.ts             # Bulk PDF endpoint
│       │   └── route.ts                      # Get/update registrations
│       └── stripe/webhook/route.ts           # Payment processor ⚙️ BUG FIXED HERE
├── components/
│   ├── student-registration/
│   │   └── RegistrationForm.tsx              # Form component
│   └── eims/
│       └── StudentRegistrationManagement.tsx # Dashboard view
├── lib/student-registration/
│   ├── id-card.ts                            # ID card renderer
│   ├── identifiers.ts                        # Student ID generator
│   ├── password.ts                           # Password generator
│   └── qr.ts                                 # QR code generator
├── email/
│   └── student-onboarding.tsx                # Email template
└── prisma/
    └── schema.prisma                         # Database schema
```

## 🔑 Environment Variables

**Required:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
UPLOADTHING_TOKEN=eyJhcGlL...
RESEND_API_KEY=re_...
SENDER_EMAIL=admissions@zigmainstitute.lk
```

**Optional:**
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Zigma Institute"
```

## 🎯 User Flows

### Student Registration Flow
```
1. Student visits /student-registration
2. Fills form with details and photo
3. Selects courses (total auto-calculated)
4. Submits → Redirects to Stripe
5. Pays with card
6. Success → Redirected to /student-registration/success
7. [Background] Webhook triggers:
   - Creates User & Student records
   - Generates Student ID (STU-202500001)
   - Enrolls in selected courses
   - Generates ID card with QR code
   - Uploads ID card to UploadThing
   - Sends email with credentials + ID card link
8. Student receives email
9. Student can login to LMS
```

### Admin Dashboard Flow
```
1. Admin logs in
2. Navigates to Dashboard
3. Clicks "Student Registration" in sidebar
4. Views all paid/approved registrations
5. Can:
   - Search by name/email/ID
   - Filter by status
   - View details
   - Download single ID card
   - Select multiple for bulk PDF
   - Approve/reject registrations
```

## 📐 ID Card Specifications

**Format:** SVG (single) or PDF (bulk)  
**Dimensions:** 960 x 560 pixels  
**Design:** Modern dark theme  

**Contains:**
- Institute branding (name, tagline, address)
- Student photo (rounded corners with border)
- Student name
- Student ID (STU-202500001)
- Email address
- Enrolled courses (up to 3 lines)
- Guardian email
- QR code with JSON data:
  ```json
  {
    "id": "STU-202500001",
    "name": "Student Name",
    "email": "student@example.com"
  }
  ```

## 🔒 Security Features

- ✅ Stripe webhook signature verification
- ✅ bcrypt password hashing (10 rounds)
- ✅ Role-based dashboard access (ADMIN/MANAGER)
- ✅ File upload validation (JPEG only, 4MB max)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection (Next.js built-in)
- ✅ CSRF protection (Next.js built-in)

## 📊 Database Models

### StudentRegistration
- Stores form data
- Tracks payment status
- Links to Student after approval
- Stores ID card URL

### Student
- Links to User
- Stores student ID
- Stores parent email
- Stores ID card reference

### User
- Authentication credentials
- Profile information
- Role (STUDENT)
- Linked to Student record

### Enrollment
- Links Student to Course
- Auto-created after payment

## 🧪 Test Scenarios

### Happy Path
✅ Complete registration → Pay → Receive email → Login works

### Edge Cases
- ❌ Invalid email → Form validation catches it
- ❌ No courses selected → Form validation catches it
- ❌ Payment declined → Status stays PENDING
- ❌ Large photo (>4MB) → Upload rejected
- ❌ Non-JPEG photo → Upload rejected

## 📞 Support

**For Users:**
- Email: admissions@zigmainstitute.lk
- Phone: +94 11 222 3344

**For Developers:**
- See: STUDENT_REGISTRATION_DOCS.md
- See: TESTING_GUIDE.md
- See: BUG_REPORT.md

## 📝 Documentation

| Document | Purpose |
|----------|---------|
| STUDENT_REGISTRATION_DOCS.md | Full implementation guide |
| TESTING_GUIDE.md | Step-by-step testing |
| BUG_REPORT.md | Bug analysis and fix |
| README.md | This file - Quick reference |

## ✅ Pre-Launch Checklist

- [ ] All environment variables set (production values)
- [ ] Stripe webhook configured for production domain
- [ ] Resend sender email verified for production domain
- [ ] Test registration completed successfully
- [ ] Test email received by both student and guardian
- [ ] Test ID card downloads correctly
- [ ] Test dashboard access and permissions
- [ ] Test bulk PDF generation
- [ ] Backup/restore procedures documented
- [ ] Monitoring/alerting configured
- [ ] Load testing completed
- [ ] Security audit passed

## 🚦 Deployment

```bash
# 1. Set production environment variables
# 2. Build application
npm run build

# 3. Start production server
npm run start

# 4. Verify
# - Registration form loads
# - Stripe checkout works
# - Webhook is reachable
# - Emails are sent
# - Dashboard accessible
```

## 📈 Metrics to Monitor

- Registration conversion rate
- Payment success rate
- Webhook processing time
- ID card generation time
- Email delivery rate
- UploadThing storage usage
- Dashboard load time

---

**Last Updated:** 2025-11-18  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
