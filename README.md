# Zigma Institute Platform

A modern education management platform built with Next.js, Prisma, and Stripe. The system provides LMS, CMS, and admissions capabilities including an automated student registration workflow.

> **Note:** For comprehensive documentation including API reference and architecture details, please see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Key Features

- **Student Registration** – Online registration with photo upload, course selection, and Stripe payment processing at `/student-registration`
- **Automated Onboarding** – After payment, automatically creates student accounts, generates ID cards with QR codes, and sends credentials via email
- **Staff Dashboard** – Review registrations, approve students, download individual ID cards or batch PDFs at `/dashboard` → Student Registration
- **Flexible ID Card Generation** – ID cards generated after payment, on staff approval, or manually via regenerate button

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
├── (root)/student-registration/    # Public registration form
├── (eims)/                          # Staff dashboard
└── api/
    ├── stripe/webhook/              # Payment webhook handler
    └── student-registration/
        ├── checkout/                # Create Stripe session
        ├── id-cards/                # Bulk PDF generation
        └── regenerate-id-card/      # Manual ID card generation

components/
└── eims/StudentRegistrationManagement.tsx  # Dashboard UI

lib/student-registration/
├── generate-id-card.ts              # Reusable ID card generator
├── id-card.ts                       # SVG/PDF renderer
├── identifiers.ts                   # Student ID generator (STU-YYYY#####)
├── password.ts                      # Password generator
└── qr.ts                            # QR code generator
```

## Testing

Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)

Verify:
1. ✅ Payment succeeds and creates student record
2. ✅ Email sent to both student and guardian
3. ✅ ID card visible in dashboard
4. ✅ Student can login with provided credentials
5. ✅ Approval generates missing ID cards
6. ✅ Manual regeneration works

## Support

For issues or questions, contact: admissions@zigmainstitute.lk
