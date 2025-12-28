import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AttendanceNotificationEmailProps {
  studentName: string;
  courseName: string;
  markedAt: string;
}

export function AttendanceNotificationEmail({
  studentName,
  courseName,
  markedAt,
}: AttendanceNotificationEmailProps) {
  const previewText = `Attendance Notification for ${studentName}`;

  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <Heading className="text-xl font-semibold text-slate-900">
              Attendance Confirmation
            </Heading>
            <Text className="mt-2 text-sm text-slate-600">Dear Parent,</Text>
            <Text className="mt-3 text-sm text-slate-600 leading-6">
              This is to inform you that your child,{" "}
              <span className="font-semibold text-slate-900">
                {studentName}
              </span>
              , has successfully marked attendance for the following session.
            </Text>

            <Section className="mt-6 rounded-lg bg-slate-100 p-4 border border-slate-200">
              <Text className="m-0 text-xs uppercase tracking-wide text-slate-500">
                Session Details
              </Text>
              <Text className="mt-2 text-sm text-slate-800">
                Course: <span className="font-semibold">{courseName}</span>
              </Text>
              <Text className="mt-1 text-sm text-slate-800">
                Date & Time: <span className="font-semibold">{markedAt}</span>
              </Text>
            </Section>

            <Hr className="my-6 border-slate-200" />
            <Text className="text-xs text-slate-500 leading-5">
              This is an automated notification from Zigma Institute. If you
              have any questions, please contact our administration.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
