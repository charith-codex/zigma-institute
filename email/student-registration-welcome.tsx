import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface StudentRegistrationWelcomeProps {
  studentName: string;
  studentId: string;
  loginEmail: string;
  password: string;
}

export default function StudentRegistrationWelcome({
  studentName,
  studentId,
  loginEmail,
  password,
}: StudentRegistrationWelcomeProps) {
  return (
    <Html>
      <Preview>Welcome to Zigma Institute</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <Heading className="text-center text-2xl font-semibold text-blue-700">
              Welcome to Zigma Institute 🎓
            </Heading>

            <Section className="mt-4 space-y-4">
              <Text className="text-base">
                Hi <strong>{studentName}</strong>,
              </Text>
              <Text className="text-base">
                Congratulations! Your enrollment is confirmed and your student ID
                card is ready. We've attached it to this email so you can download
                or print it whenever you need.
              </Text>
            </Section>

            <Section className="mt-6 rounded-xl bg-blue-50 p-4">
              <Text className="text-sm font-semibold uppercase text-blue-600">
                Student ID
              </Text>
              <Text className="text-lg font-semibold text-blue-800">
                {studentId}
              </Text>
            </Section>

            <Section className="mt-6 space-y-2 rounded-xl bg-gray-900 p-4 text-white">
              <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                LMS Login Credentials
              </Text>
              <Text className="text-base">Email: {loginEmail}</Text>
              <Text className="text-base">Temporary Password: {password}</Text>
              <Text className="text-sm text-gray-300">
                Use these details to sign in to the student portal. For security,
                please change your password after your first login.
              </Text>
            </Section>

            <Section className="mt-6 space-y-3">
              <Text className="text-base">
                If you need any help getting started, our support team is ready to
                assist you. Just reply to this email or reach out through the LMS
                help desk.
              </Text>
              <Text className="text-base">
                We're excited to have you on board and can't wait to see you excel!
              </Text>
            </Section>

            <Section className="mt-8 text-center text-sm text-gray-500">
              <Text>— Zigma Institute Student Success Team</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
