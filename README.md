# Zigma Institute Platform

A modern education management platform built with Next.js, Prisma, and Stripe. The system powers LMS, CMS, and admissions experiences including an end-to-end online student registration workflow.

## Key Features

- **Student registration with payments** – Collect student & guardian details, photo uploads via UploadThing, Stripe Checkout payments, and course selection on `/student-registration`.
- **Automated onboarding** – Webhooks provision users/students in PostgreSQL via Prisma, enrol them into courses, generate SVG/PNG ID cards with QR codes, upload the cards to UploadThing, and email credentials with Resend.
- **Operations dashboard** – Admissions staff can review paid registrations, approve them, and download individual or batched ID card PDFs from the EIMS dashboard.

## Getting Started

Install dependencies and generate the Prisma client:

```bash
npm install
npm run postinstall
```

Create a `.env` file (see `.env.example`) and configure the required secrets. Then run the Prisma migrations against your PostgreSQL database:

```bash
npx prisma migrate deploy
```

Finally, start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Environment Variables

| Name | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Required for NextAuth session handling. |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe credentials for Checkout. |
| `STRIPE_WEBHOOK_SECRET` | Secret used to verify Stripe webhooks. |
| `UPLOADTHING_TOKEN` | UploadThing API token for handling file uploads. |
| `RESEND_API_KEY` | API key used to send onboarding emails. |
| `NEXT_PUBLIC_SERVER_URL` | Public base URL used when constructing callback links. |

## Stripe Webhook

Run the webhook listener locally when developing payments:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set the `STRIPE_WEBHOOK_SECRET` environment variable to the value returned by the Stripe CLI.

## Testing Notes

Automated tests are not yet included for the admissions flow. When performing manual QA, verify:

1. Checkout session creation with mixed course currencies is rejected.
2. Successful payments create students, enrolments, and ID cards.
3. ID card emails include the UploadThing link and LMS credentials for both student and guardian.
