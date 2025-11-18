import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link as EmailLink,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface StudentOnboardingEmailProps {
  studentName: string;
  studentEmail: string;
  temporaryPassword: string;
  idCardUrl: string;
  courses: string[];
}

export function StudentOnboardingEmail({
  studentName,
  studentEmail,
  temporaryPassword,
  idCardUrl,
  courses,
}: StudentOnboardingEmailProps) {
  const previewText = `Welcome to Zigma Institute, ${studentName}!`;
  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <Heading className="text-2xl font-semibold text-slate-900">
              Welcome to Zigma Institute
            </Heading>
            <Text className="mt-2 text-sm text-slate-600">
              Hi {studentName},
            </Text>
            <Text className="mt-3 text-sm text-slate-600 leading-6">
              Your enrolment is confirmed and your learning workspace is ready. Use the
              credentials below to access the LMS immediately. We recommend changing the
              password after your first login.
            </Text>
            <Section className="mt-6 rounded-lg bg-slate-100 p-4">
              <Text className="m-0 text-xs uppercase tracking-wide text-slate-500">
                LMS credentials
              </Text>
              <Text className="mt-2 text-sm text-slate-800">
                Email: <span className="font-semibold">{studentEmail}</span>
              </Text>
              <Text className="mt-1 text-sm text-slate-800">
                Temporary password: <span className="font-semibold">{temporaryPassword}</span>
              </Text>
            </Section>
            {idCardUrl && (
              <Section className="mt-6 rounded-lg bg-slate-100 p-4">
                <Text className="m-0 text-xs uppercase tracking-wide text-slate-500">
                  Download your student ID card
                </Text>
                <EmailLink
                  href={idCardUrl}
                  className="mt-2 inline-block text-sm font-medium text-indigo-600"
                >
                  View ID card
                </EmailLink>
                <Text className="mt-2 text-xs text-slate-500">
                  Keep this digital ID saved. You can present it for onsite verification or
                  print it for quick access.
                </Text>
              </Section>
            )}
            {!idCardUrl && (
              <Section className="mt-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
                <Text className="m-0 text-xs uppercase tracking-wide text-amber-700">
                  ID Card Generation Pending
                </Text>
                <Text className="mt-2 text-xs text-amber-600">
                  Your student ID card is being processed and will be emailed to you shortly. 
                  You can also download it from the student portal once available.
                </Text>
              </Section>
            )}
            <Section className="mt-6">
              <Text className="text-sm font-medium text-slate-800">Assigned courses</Text>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {courses.length > 0 ? (
                  courses.map((course) => <li key={course}>{course}</li>)
                ) : (
                  <li>Your course list will be available after your first login.</li>
                )}
              </ul>
            </Section>
            <Hr className="my-6 border-slate-200" />
            <Text className="text-xs text-slate-500 leading-5">
              Need help? Reply to this email or reach us on +94 11 222 3344. We look forward
              to seeing you online.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
