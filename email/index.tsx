import React from "react";
import { Resend } from "resend";
import "dotenv/config";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import PaymentInvoice from "./payment-invoice";
import { StudentOnboardingEmail } from "./student-onboarding";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPaymentInvoice = async (email: string, orderId: string) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Order Confirmation ${orderId}`,
    react: <PaymentInvoice orderId={orderId} />,
  });
};

interface StudentOnboardingEmailPayload {
  studentEmail: string;
  guardianEmail: string;
  studentName: string;
  guardianName: string;
  temporaryPassword: string;
  idCardUrl: string;
  courses: string[];
}

export const sendStudentOnboardingEmail = async ({
  studentEmail,
  guardianEmail,
  studentName,
  guardianName,
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
        guardianName={guardianName}
        studentEmail={studentEmail}
        temporaryPassword={temporaryPassword}
        idCardUrl={idCardUrl}
        courses={courses}
      />
    ),
  });
};
