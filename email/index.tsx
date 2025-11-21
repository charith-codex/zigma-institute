import React from "react";
import { Resend } from "resend";
import "dotenv/config";
import { SENDER_EMAIL, APP_NAME, SERVER_URL } from "@/lib/constants";
import PaymentInvoice from "./payment-invoice";
import { StudentOnboardingEmail } from "./student-onboarding";
import { PasswordResetEmail } from "./password-reset";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPaymentInvoice = async (email: string, orderId: string) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Order Confirmation ${orderId}`,
    react: <PaymentInvoice orderId={orderId} />,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${SERVER_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    react: <PasswordResetEmail resetUrl={resetUrl} />,
  });
};

interface StudentOnboardingEmailPayload {
  studentEmail: string;
  guardianEmail: string;
  studentName: string;
  temporaryPassword: string;
  idCardUrl: string;
  courses: string[];
}

export const sendStudentOnboardingEmail = async ({
  studentEmail,
  guardianEmail,
  studentName,
  temporaryPassword,
  idCardUrl,
  courses,
}: StudentOnboardingEmailPayload) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: [studentEmail, guardianEmail],
    subject: `Welcome to ${APP_NAME}`,
    react: (
      <StudentOnboardingEmail
        studentName={studentName}
        studentEmail={studentEmail}
        temporaryPassword={temporaryPassword}
        idCardUrl={idCardUrl}
        courses={courses}
      />
    ),
  });
};
