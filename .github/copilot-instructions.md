# Zigma Institute – Copilot Instructions

## Platform Mental Model

- Multi-surface Next.js 15 App Router project: marketing in `app/(root)`, LMS student area in `app/(lms)`, staff CMS in `app/(cms)`, admin/EIMS dashboards in `app/(eims)`, experiments in `app/(testing)`.
- Each route group owns its layout (`app/(*/layout.tsx)`) with the themed header, `SessionProvider`, and `SidebarProvider` as needed; keep new pages inside the correct group to inherit auth + chrome automatically.
- Global wrappers live in `app/layout.tsx` and provide Tailwind globals, `next-themes` dark mode, toaster, and the cross-surface `NotificationProvider`.
- Server actions live close to features (`app/actions`, `lib/actions`, or feature folders) and are consumed directly by client components; always mark them with `"use server"` and keep data validation nearby.

## Data + Persistence

- Prisma schema (`prisma/schema.prisma`) models users, courses, schedules, registrations, exams, notifications, etc.; generators output to `lib/generated/prisma` so import the client via `@/db/prisma`.
- `db/prisma.ts` already wires the Neon adapter and memoizes the client—never instantiate `PrismaClient` elsewhere or you will leak connections.
- Student onboarding data is split between `StudentRegistration`, `Student`, `PaymentTransaction`, and helper tables; reuse the helpers in `lib/student-registration/**` for ID cards, QR codes, and identifiers instead of duplicating logic.
- When seeding or running scripts rely on `npx prisma migrate deploy` (per README) before hitting APIs, and remember `postinstall` already runs `prisma generate`.

## Auth + Session Patterns

- NextAuth config is centralized in `auth.ts` using the Prisma adapter and credentials provider; new auth behaviors (custom callbacks, extra user fields) belong there.
- Layouts wrap children in `SessionProvider` so client components can call `useSession`; server components should use the exported `auth()` helper.
- User roles (`UserRole` enum) gate access across LMS/CMS/EIMS—tie UI conditions to these enums instead of hard-coded strings.

## Feature Conventions

- Marketing pages share `Header`/`Footer` via `app/(root)/layout.tsx` and lean on static content plus component modules under `components/courses`, `components/contact`, etc.
- Dashboard surfaces expect sidebar-aware pages; build them with the primitives in `components/ui/sidebar` plus feature modules under `components/{cms,eims,lms}`.
- Notifications use the context in `components/providers/notification-provider.tsx` backed by the `app/actions/notifications.ts` server action; keep CRUD changes in sync between the action and types in `types/notifications.ts`.
- APIs live under `app/api/**` and mirror workflow steps (e.g., `app/api/student-registration/*` for payments/id-card regeneration); keep new endpoints colocated with the feature directory.
- React Email templates are stored in `email/`; render them with `@react-email/render` and send through Resend via helpers in `email/index.tsx`.

## Tooling + Workflows

- Use npm scripts: `npm run dev`/`build` leverage Turbopack, `npm run lint` runs the repo-wide ESLint config, `npm run start` serves the production build.
- Required env vars are listed in README (`DATABASE_URL`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `UPLOADTHING_TOKEN`, `RESEND_API_KEY`, etc.); keep feature-specific secrets documented when adding new ones.
- For local Stripe hooks, run `stripe listen --forward-to localhost:3000/api/stripe/webhook`; QA the full registration loop with the documented `4242` card and ensure ID cards/emails are produced.
- File uploads flow through UploadThing (`lib/uploadthing.ts`), and payments rely on `lib/payments.ts`/`lib/stripe.ts`; prefer extending these helpers over calling SDKs ad hoc.
- Styling uses Tailwind CSS (v4 preview) with `cn`/`formatCurrency` helpers in `lib/utils.ts`; keep utility functions centralized there to avoid inconsistent formatting.

## Gotchas & Tips

- Many components are server by default—add `"use client"` only when hooks or browser APIs are required to avoid bundling issues.
- When touching Prisma models that feed Stripe or onboarding automations, audit all dependent server actions (`app/api/student-registration/*`, `lib/student-registration/**`, dashboard components) to keep the flow consistent.
- Sidebar/layout spacing differs between LMS (`pt-14`) and EIMS (`pt-18`); match the platform’s layout to avoid clipped content.
- If you add new notification channels or enums, update both the Prisma enum (`NotificationChannel`), the type alias in `types/notifications.ts`, and the mapping helpers inside the server action.
- Email/SMS sending happens asynchronously in server actions—log errors but don’t throw unless the UI can recover.
