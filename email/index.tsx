import React from "react";
import { Resend } from "resend";
import "dotenv/config";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import PaymentInvoice from "./payment-invoice";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPaymentInvoice = async (email: string, orderId: string) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Order Confirmation ${orderId}`,
    react: <PaymentInvoice orderId={orderId} />,
  });
};
