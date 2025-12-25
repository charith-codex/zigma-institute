import React from "react";
import { Resend } from "resend";
import "dotenv/config";
import { SENDER_EMAIL, APP_NAME, SERVER_URL } from "@/lib/constants";
import PaymentInvoice from "./payment-invoice";
import { StudentOnboardingEmail } from "./student-onboarding";
import { PasswordResetEmail } from "./password-reset";
import { InquiryResponseEmail } from "./inquiry-response";

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

interface InquiryResponsePayload {
  to: string;
  name: string;
  subject: string;
  response: string;
}

export const sendInquiryResponseEmail = async ({
  to,
  name,
  subject,
  response,
}: InquiryResponsePayload) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to,
    subject: `Response: ${subject}`,
    react: (
      <InquiryResponseEmail name={name} response={response} subject={subject} />
    ),
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
  const attachments = [];

  // If idCardUrl is a data URL, extract it as an attachment
  if (idCardUrl && idCardUrl.startsWith("data:")) {
    try {
      const [_header, base64Data] = idCardUrl.split(",");
      attachments.push({
        filename: "student-id-card.svg",
        content: base64Data,
      });
    } catch (err) {
      console.error("Failed to parse ID card data URL for attachment", err);
    }
  }

  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: [studentEmail, guardianEmail],
    subject: `Welcome to ${APP_NAME}`,
    attachments,
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
